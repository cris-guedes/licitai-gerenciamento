/* eslint-disable @typescript-eslint/no-namespace */
import type { IObjectStorageProvider } from "@/server/modules/core-api/domain/data/IObjectStorageProvider";
import type { IVectorStore } from "@/server/modules/core-api/domain/data/IVectorStore";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import type { DeleteLicitacaoDraftDTO } from "./dtos/DeleteLicitacaoDraftDTOs";
import { DeleteLicitacaoDraftMapper, type DeleteLicitacaoDraftView } from "./dtos/DeleteLicitacaoDraftView";

export class DeleteLicitacaoDraft {
    constructor(
        private readonly oportunidadeRepository: PrismaOportunidadeRepository,
        private readonly objectStorageProvider: IObjectStorageProvider.Contract,
        private readonly vectorStore: IVectorStore.Contract,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
        private readonly config: DeleteLicitacaoDraft.Config,
    ) {}

    async execute(params: DeleteLicitacaoDraft.Params): Promise<DeleteLicitacaoDraft.Response> {
        await assertUserCanAccessCompany({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        const oportunidade = await this.oportunidadeRepository.findWorkspaceById({
            oportunidadeId: params.oportunidadeId,
            companyId: params.companyId,
        });

        if (!oportunidade || oportunidade.status !== "DRAFT") {
            throw new Error("Rascunho não encontrado.");
        }

        const documents = oportunidade.edital?.documents ?? [];

        await Promise.all(documents.map(async document => {
            await this.objectStorageProvider.deleteDocument({ key: document.storageKey }).catch(() => undefined);
            await this.vectorStore.deleteByFilter(this.config.vectorCollectionName, {
                must: [{ key: "document_id", match: { value: document.id } }],
            }).catch(() => undefined);
        }));

        await this.oportunidadeRepository.deleteDraftById({
            oportunidadeId: oportunidade.id,
            companyId: oportunidade.companyId,
            licitacaoId: oportunidade.licitacaoId,
            editalId: oportunidade.editalId,
            responsavelUserId: oportunidade.responsavelUserId,
            documentIds: documents.map(document => document.id),
        });

        return DeleteLicitacaoDraftMapper.toView({
            oportunidadeId: oportunidade.id,
            deletedDocuments: documents.length,
        });
    }
}

export namespace DeleteLicitacaoDraft {
    export type Config = {
        vectorCollectionName: string;
    };

    export type Params = DeleteLicitacaoDraftDTO;
    export type Response = DeleteLicitacaoDraftView;
}
