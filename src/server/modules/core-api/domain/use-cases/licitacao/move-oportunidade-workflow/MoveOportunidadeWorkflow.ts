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

        const canTransition = workflow.transitions.some(transition =>
            transition.fromNodeId === oportunidade.currentNodeId && transition.toNodeId === targetNode.id,
        );

        if (!canTransition) {
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
}

export namespace MoveOportunidadeWorkflow {
    export type Params = MoveOportunidadeWorkflowDTO;
    export type Response = MoveOportunidadeWorkflowView;
}
