/* eslint-disable @typescript-eslint/no-namespace */
import { OportunidadeStatus } from "@prisma/client";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { assertUserCanAccessCompany } from "../../../company/_shared/assertCompanyAccess";

export class DeleteOportunidadeTask {
    constructor(
        private readonly oportunidadeRepository: PrismaOportunidadeRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: DeleteOportunidadeTask.Params): Promise<DeleteOportunidadeTask.Response> {
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
            throw new Error("Somente oportunidades ativas podem remover tarefas.");
        }

        const task = await this.oportunidadeRepository.findTaskById({
            companyId: params.companyId,
            oportunidadeId: params.oportunidadeId,
            taskId: params.taskId,
        });

        if (!task) {
            throw new Error("Tarefa não encontrada.");
        }

        const deleted = await this.oportunidadeRepository.deleteTaskById({
            taskId: params.taskId,
        });

        return {
            taskId: deleted.id,
        };
    }
}

export namespace DeleteOportunidadeTask {
    export type Params = {
        companyId: string;
        oportunidadeId: string;
        taskId: string;
        userId: string;
    };

    export type Response = {
        taskId: string;
    };
}
