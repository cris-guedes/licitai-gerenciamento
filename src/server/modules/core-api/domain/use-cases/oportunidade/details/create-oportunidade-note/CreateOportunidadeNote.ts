/* eslint-disable @typescript-eslint/no-namespace */
import { OportunidadeStatus } from "@prisma/client";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { assertUserCanAccessCompany } from "../../../company/_shared/assertCompanyAccess";
import { LicitacaoWorkspaceViewMapper, type LicitacaoWorkspaceNoteView } from "../../../licitacao/_shared/licitacaoWorkspaceView";

export class CreateOportunidadeNote {
    constructor(
        private readonly oportunidadeRepository: PrismaOportunidadeRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: CreateOportunidadeNote.Params): Promise<CreateOportunidadeNote.Response> {
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
            throw new Error("Somente oportunidades ativas podem receber notas.");
        }

        const note = await this.oportunidadeRepository.createNote({
            companyId: params.companyId,
            oportunidadeId: params.oportunidadeId,
            createdById: params.userId,
            content: this.normalizeRequiredText(params.content, "Informe um conteúdo para a nota."),
        });

        return {
            note: LicitacaoWorkspaceViewMapper.toNoteView(note),
        };
    }

    private normalizeRequiredText(value: string, message: string) {
        const trimmed = value.trim();
        if (!trimmed) throw new Error(message);
        return trimmed;
    }
}

export namespace CreateOportunidadeNote {
    export type Params = {
        companyId: string;
        oportunidadeId: string;
        content: string;
        userId: string;
    };

    export type Response = {
        note: LicitacaoWorkspaceNoteView;
    };
}
