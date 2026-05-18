/* eslint-disable @typescript-eslint/no-namespace */
import { OportunidadeStatus } from "@prisma/client";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { assertUserCanAccessCompany } from "../../../company/_shared/assertCompanyAccess";
import { LicitacaoWorkspaceViewMapper, type LicitacaoWorkspaceTaskView } from "../../../licitacao/_shared/licitacaoWorkspaceView";

export class CreateOportunidadeTask {
    constructor(
        private readonly oportunidadeRepository: PrismaOportunidadeRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: CreateOportunidadeTask.Params): Promise<CreateOportunidadeTask.Response> {
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
            throw new Error("Somente oportunidades ativas podem receber tarefas.");
        }

        const title = this.normalizeRequiredText(params.title, "Informe um título para a tarefa.");
        const task = await this.oportunidadeRepository.createTask({
            companyId: params.companyId,
            oportunidadeId: params.oportunidadeId,
            createdById: params.userId,
            title,
            dueAt: this.normalizeDate(params.dueAt, "prazo"),
        });

        return {
            task: LicitacaoWorkspaceViewMapper.toTaskView(task),
        };
    }

    private normalizeRequiredText(value: string, message: string) {
        const trimmed = value.trim();
        if (!trimmed) throw new Error(message);
        return trimmed;
    }

    private normalizeDate(value: string | null | undefined, label: string) {
        if (value === null || value === undefined || value.trim() === "") return null;
        const trimmed = value.trim();
        const date = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
            ? new Date(`${trimmed}T00:00:00.000Z`)
            : new Date(trimmed);

        if (Number.isNaN(date.getTime())) {
            throw new Error(`Data de ${label} inválida.`);
        }

        return date;
    }
}

export namespace CreateOportunidadeTask {
    export type Params = {
        companyId: string;
        oportunidadeId: string;
        title: string;
        dueAt?: string | null;
        userId: string;
    };

    export type Response = {
        task: LicitacaoWorkspaceTaskView;
    };
}
