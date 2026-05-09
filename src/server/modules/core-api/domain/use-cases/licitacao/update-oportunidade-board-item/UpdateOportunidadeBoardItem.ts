/* eslint-disable @typescript-eslint/no-namespace */
import { OportunidadeStatus } from "@prisma/client";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { PrismaWorkflowRepository } from "@/server/shared/infra/repositories/workflow.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import { OportunidadeBoardViewMapper } from "../_shared/oportunidadeBoardView";
import type { UpdateOportunidadeBoardItemDTO } from "./dtos/UpdateOportunidadeBoardItemDTOs";
import type { UpdateOportunidadeBoardItemView } from "./dtos/UpdateOportunidadeBoardItemView";

type WorkflowMetadata = {
    boardColumnKindKey: string;
    primaryBadgeKindKey: string;
    secondaryBadgeKindKey: string;
};

type WorkflowNode = PrismaWorkflowRepository.WorkflowDefinitionWithGraph["nodes"][number];

export class UpdateOportunidadeBoardItem {
    constructor(
        private readonly oportunidadeRepository: PrismaOportunidadeRepository,
        private readonly workflowRepository: PrismaWorkflowRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: UpdateOportunidadeBoardItem.Params): Promise<UpdateOportunidadeBoardItem.Response> {
        const company = await assertUserCanAccessCompany({
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
            throw new Error("Somente oportunidades ativas podem ser atualizadas no board.");
        }

        const data: PrismaOportunidadeRepository.UpdateData = {};

        if (params.responsavelUserId !== undefined) {
            if (params.responsavelUserId) {
                const membership = await this.membershipRepository.findByUserIdAndOrganizationId({
                    userId: params.responsavelUserId,
                    organizationId: company.organizationId,
                });

                if (!membership) {
                    throw new Error("Responsável não pertence à organização da empresa.");
                }
            }

            data.responsavelUserId = params.responsavelUserId;
        }

        const hasWorkflowUpdate = Boolean(params.phaseNodeId || params.statusNodeId || params.situationNodeId);
        if (hasWorkflowUpdate) {
            if (!oportunidade.workflowDefinitionId) {
                throw new Error("A oportunidade ainda não possui um workflow ativo configurado.");
            }

            const workflow = await this.workflowRepository.findDefinitionById({
                id: oportunidade.workflowDefinitionId,
                companyId: params.companyId,
            });

            if (!workflow) {
                throw new Error("Workflow da oportunidade não encontrado.");
            }

            const metadata = this.readWorkflowMetadata(workflow);
            const phaseNode = params.phaseNodeId
                ? this.getWorkflowNodeByKind(workflow, params.phaseNodeId, metadata.boardColumnKindKey, "fase")
                : null;
            const statusNode = params.statusNodeId
                ? this.getWorkflowNodeByKind(workflow, params.statusNodeId, metadata.primaryBadgeKindKey, "status")
                : null;
            const situationNode = params.situationNodeId
                ? this.getWorkflowNodeByKind(workflow, params.situationNodeId, metadata.secondaryBadgeKindKey, "situação")
                : null;

            this.assertCompatibleSelection(workflow, {
                phaseNode,
                statusNode,
                situationNode,
            });

            const targetNode = situationNode ?? statusNode ?? phaseNode;
            if (!targetNode) {
                throw new Error("Nó de destino do workflow não encontrado.");
            }

            const placement = this.workflowRepository.resolvePlacementFromDefinitionAndCurrentNode(
                workflow,
                targetNode.id,
            );

            if (!placement) {
                throw new Error("Não foi possível resolver a posição final do workflow para o destino informado.");
            }

            data.currentNodeId = placement.currentNodeId;
            data.currentPhaseNodeId = placement.currentPhaseNodeId;
            data.currentStatusNodeId = placement.currentStatusNodeId;
            data.currentSituationNodeId = placement.currentSituationNodeId;
            data.workflowUpdatedAt = new Date();
        }

        await this.oportunidadeRepository.update({
            id: oportunidade.id,
            data,
        });

        const updated = await this.oportunidadeRepository.findBoardById({
            companyId: params.companyId,
            oportunidadeId: oportunidade.id,
        });

        if (!updated) {
            throw new Error("Não foi possível recarregar a oportunidade após a atualização.");
        }

        return {
            item: OportunidadeBoardViewMapper.toItemView({
                oportunidade: updated,
                currentUserId: params.userId,
            }),
        };
    }

    private readWorkflowMetadata(
        workflow: PrismaWorkflowRepository.WorkflowDefinitionWithGraph,
    ): WorkflowMetadata {
        const object = workflow.metadata && typeof workflow.metadata === "object" && !Array.isArray(workflow.metadata)
            ? workflow.metadata as Record<string, unknown>
            : {};

        return {
            boardColumnKindKey: typeof object.boardColumnKindKey === "string" ? object.boardColumnKindKey : "phase",
            primaryBadgeKindKey: typeof object.primaryBadgeKindKey === "string" ? object.primaryBadgeKindKey : "status",
            secondaryBadgeKindKey: typeof object.secondaryBadgeKindKey === "string" ? object.secondaryBadgeKindKey : "situation",
        };
    }

    private getWorkflowNodeByKind(
        workflow: PrismaWorkflowRepository.WorkflowDefinitionWithGraph,
        nodeId: string,
        kindKey: string,
        label: string,
    ): WorkflowNode {
        const node = workflow.nodes.find(item => item.id === nodeId);
        if (!node) {
            throw new Error(`Nó de ${label} não encontrado no workflow.`);
        }

        if (node.kind.key !== kindKey) {
            throw new Error(`O nó informado não é um nó de ${label} válido para este workflow.`);
        }

        return node;
    }

    private assertCompatibleSelection(
        workflow: PrismaWorkflowRepository.WorkflowDefinitionWithGraph,
        selection: {
            phaseNode: WorkflowNode | null;
            statusNode: WorkflowNode | null;
            situationNode: WorkflowNode | null;
        },
    ) {
        if (selection.phaseNode && selection.statusNode && !this.isAncestor(workflow, selection.phaseNode.id, selection.statusNode.id)) {
            throw new Error("O status selecionado não pertence à fase selecionada.");
        }

        if (selection.statusNode && selection.situationNode && !this.isAncestor(workflow, selection.statusNode.id, selection.situationNode.id)) {
            throw new Error("A situação selecionada não pertence ao status selecionado.");
        }

        if (selection.phaseNode && selection.situationNode && !this.isAncestor(workflow, selection.phaseNode.id, selection.situationNode.id)) {
            throw new Error("A situação selecionada não pertence à fase selecionada.");
        }
    }

    private isAncestor(
        workflow: PrismaWorkflowRepository.WorkflowDefinitionWithGraph,
        ancestorNodeId: string,
        descendantNodeId: string,
    ) {
        let cursor = workflow.nodes.find(node => node.id === descendantNodeId) ?? null;

        while (cursor) {
            if (cursor.id === ancestorNodeId) return true;
            cursor = cursor.parentId
                ? workflow.nodes.find(node => node.id === cursor?.parentId) ?? null
                : null;
        }

        return false;
    }
}

export namespace UpdateOportunidadeBoardItem {
    export type Params = UpdateOportunidadeBoardItemDTO;
    export type Response = UpdateOportunidadeBoardItemView;
}
