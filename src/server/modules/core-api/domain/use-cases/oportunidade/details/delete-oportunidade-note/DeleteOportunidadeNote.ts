/* eslint-disable @typescript-eslint/no-namespace */
import { OportunidadeStatus } from "@prisma/client";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { assertUserCanAccessCompany } from "../../../company/_shared/assertCompanyAccess";

export class DeleteOportunidadeNote {
    constructor(
        private readonly oportunidadeRepository: PrismaOportunidadeRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: DeleteOportunidadeNote.Params): Promise<DeleteOportunidadeNote.Response> {
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
            throw new Error("Somente oportunidades ativas podem remover notas.");
        }

        const note = await this.oportunidadeRepository.findNoteById({
            companyId: params.companyId,
            oportunidadeId: params.oportunidadeId,
            noteId: params.noteId,
        });

        if (!note) {
            throw new Error("Nota não encontrada.");
        }

        const deleted = await this.oportunidadeRepository.deleteNoteById({
            noteId: params.noteId,
        });

        return {
            noteId: deleted.id,
        };
    }
}

export namespace DeleteOportunidadeNote {
    export type Params = {
        companyId: string;
        oportunidadeId: string;
        noteId: string;
        userId: string;
    };

    export type Response = {
        noteId: string;
    };
}
