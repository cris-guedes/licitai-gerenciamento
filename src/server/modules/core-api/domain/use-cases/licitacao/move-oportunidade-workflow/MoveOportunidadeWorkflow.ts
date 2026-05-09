/* eslint-disable @typescript-eslint/no-namespace */
import { OportunidadeStatus } from "@prisma/client";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { PrismaWorkflowRepository } from "@/server/shared/infra/repositories/workflow.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import { OportunidadeBoardViewMapper } from "../_shared/oportunidadeBoardView";
import type { MoveOportunidadeWorkflowDTO } from "./dtos/MoveOportunidadeWorkflowDTOs";
import type { MoveOportunidadeWorkflowView } from "./dtos/MoveOportunidadeWorkflowView";

type WorkflowDefinition = PrismaWorkflowRepository.WorkflowDefinitionWithGraph;
type WorkflowNode = WorkflowDefinition["nodes"][number];

export class MoveOportunidadeWorkflow {
    constructor(
        private readonly oportunidadeRepository: PrismaOportunidadeRepository,
        private readonly workflowRepository: PrismaWorkflowRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: MoveOportunidadeWorkflow.Params): Promise<MoveOportunidadeWorkflow.Response> {
        await assertUserCanAccessCompany({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        const oportunidade = await this.oportunidadeRepository.findBoardById({
            companyId: params.companyId,
            oportunidadeId: params.oportunidadeId,
        });

        if (!oportunidade) {
            throw new Error("Oportunidade não encontrada.");
        }

        if (oportunidade.status !== OportunidadeStatus.ACTIVE) {
            throw new Error("Somente oportunidades ativas podem ser movidas no workflow.");
        }

        if (!oportunidade.responsavelUserId || oportunidade.responsavelUserId !== params.userId) {
            throw new Error("Somente o responsável pode mover esta oportunidade.");
        }

        if (!oportunidade.workflowDefinitionId || !oportunidade.currentNodeId) {
            throw new Error("A oportunidade ainda não possui um workflow ativo configurado.");
        }

        const workflow = await this.workflowRepository.findDefinitionById({
            id: oportunidade.workflowDefinitionId,
            companyId: params.companyId,
        });

        if (!workflow) {
            throw new Error("Workflow da oportunidade não encontrado.");
        }

        const targetNode = workflow.nodes.find(node => node.id === params.targetNodeId);
        if (!targetNode) {
            throw new Error("Nó de destino do workflow não encontrado.");
        }

        const targetPlacement = this.workflowRepository.resolvePlacementFromDefinitionAndCurrentNode(
            workflow,
            targetNode.id,
        );

        if (!targetPlacement) {
            throw new Error("Não foi possível resolver a posição final do workflow para o destino informado.");
        }

        const sourceNodeIds = this.getNodeAncestryIds(workflow, oportunidade.currentNodeId);
        const targetNodeIds = this.getNodeAncestryIds(workflow, targetNode.id);
        const hasExplicitTransition = workflow.transitions.some(transition =>
            sourceNodeIds.includes(transition.fromNodeId) && targetNodeIds.includes(transition.toNodeId),
        );
        const canMoveBackward = this.isBackwardBoardMove(workflow, oportunidade.currentNodeId, targetNode.id);

        if (!hasExplicitTransition && !canMoveBackward) {
            throw new Error("A transição solicitada não é permitida pelo workflow atual.");
        }

        await this.oportunidadeRepository.update({
            id: oportunidade.id,
            data: {
                currentNodeId: targetPlacement.currentNodeId,
                currentPhaseNodeId: targetPlacement.currentPhaseNodeId,
                currentStatusNodeId: targetPlacement.currentStatusNodeId,
                currentSituationNodeId: targetPlacement.currentSituationNodeId,
                workflowUpdatedAt: new Date(),
            },
        });

        const updated = await this.oportunidadeRepository.findBoardById({
            companyId: params.companyId,
            oportunidadeId: oportunidade.id,
        });

        if (!updated) {
            throw new Error("Não foi possível recarregar a oportunidade após a movimentação.");
        }

        return {
            item: OportunidadeBoardViewMapper.toItemView({
                oportunidade: updated,
                currentUserId: params.userId,
            }),
        };
    }

    private getNodeAncestryIds(
        workflow: WorkflowDefinition,
        nodeId: string,
    ): string[] {
        return this.getNodeAncestry(workflow, nodeId).map(node => node.id);
    }

    private getNodeAncestry(
        workflow: WorkflowDefinition,
        nodeId: string,
    ): WorkflowDefinition["nodes"] {
        const ids: string[] = [];
        let cursor = workflow.nodes.find(node => node.id === nodeId) ?? null;

        while (cursor) {
            ids.push(cursor.id);
            cursor = cursor.parentId
                ? workflow.nodes.find(node => node.id === cursor?.parentId) ?? null
                : null;
        }

        return ids
            .map(id => workflow.nodes.find(node => node.id === id))
            .filter((node): node is WorkflowNode => Boolean(node));
    }

    private isBackwardBoardMove(
        workflow: WorkflowDefinition,
        sourceNodeId: string,
        targetNodeId: string,
    ): boolean {
        const { boardColumnKindKey } = this.readWorkflowMetadata(workflow);
        const sourcePhase = this.getNodeAncestry(workflow, sourceNodeId)
            .find(node => node.kind.key === boardColumnKindKey) ?? null;
        const targetPhase = this.getNodeAncestry(workflow, targetNodeId)
            .find(node => node.kind.key === boardColumnKindKey) ?? null;

        if (!sourcePhase || !targetPhase || sourcePhase.id === targetPhase.id) {
            return false;
        }

        return this.compareNodes(targetPhase, sourcePhase) < 0;
    }

    private readWorkflowMetadata(workflow: WorkflowDefinition) {
        const object = workflow.metadata && typeof workflow.metadata === "object" && !Array.isArray(workflow.metadata)
            ? workflow.metadata as Record<string, unknown>
            : {};

        return {
            boardColumnKindKey: typeof object.boardColumnKindKey === "string" ? object.boardColumnKindKey : "phase",
        };
    }

    private compareNodes(a: WorkflowNode, b: WorkflowNode): number {
        if (a.order !== b.order) return a.order - b.order;

        const createdAtDiff = a.createdAt.getTime() - b.createdAt.getTime();
        if (createdAtDiff !== 0) return createdAtDiff;

        return a.id.localeCompare(b.id);
    }
}

export namespace MoveOportunidadeWorkflow {
    export type Params = MoveOportunidadeWorkflowDTO;
    export type Response = MoveOportunidadeWorkflowView;
}
