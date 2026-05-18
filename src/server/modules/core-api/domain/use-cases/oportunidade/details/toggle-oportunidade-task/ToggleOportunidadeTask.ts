/* eslint-disable @typescript-eslint/no-namespace */
import { OportunidadeStatus, OportunidadeTaskStatus } from "@prisma/client";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { assertUserCanAccessCompany } from "../../../company/_shared/assertCompanyAccess";
import { LicitacaoWorkspaceViewMapper, type LicitacaoWorkspaceTaskView } from "../../../licitacao/_shared/licitacaoWorkspaceView";

export class ToggleOportunidadeTask {
    constructor(
        private readonly oportunidadeRepository: PrismaOportunidadeRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: ToggleOportunidadeTask.Params): Promise<ToggleOportunidadeTask.Response> {
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
            throw new Error("Somente oportunidades ativas podem atualizar tarefas.");
        }

        const task = await this.oportunidadeRepository.findTaskById({
            companyId: params.companyId,
            oportunidadeId: params.oportunidadeId,
            taskId: params.taskId,
        });

        if (!task) {
            throw new Error("Tarefa não encontrada.");
        }

        const updated = await this.oportunidadeRepository.updateTaskStatus({
            taskId: params.taskId,
            status: params.status === "DONE" ? OportunidadeTaskStatus.DONE : OportunidadeTaskStatus.OPEN,
            completedAt: params.status === "DONE" ? new Date() : null,
        });

        return {
            task: LicitacaoWorkspaceViewMapper.toTaskView(updated),
        };
    }
}

export namespace ToggleOportunidadeTask {
    export type Params = {
        companyId: string;
        oportunidadeId: string;
        taskId: string;
        status: "OPEN" | "DONE";
        userId: string;
    };

    export type Response = {
        task: LicitacaoWorkspaceTaskView;
    };
}
