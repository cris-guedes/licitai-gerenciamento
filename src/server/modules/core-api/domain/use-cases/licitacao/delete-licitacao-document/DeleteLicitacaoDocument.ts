/* eslint-disable @typescript-eslint/no-namespace */
import type { IObjectStorageProvider } from "@/server/modules/core-api/domain/data/IObjectStorageProvider";
import type { IVectorStore } from "@/server/modules/core-api/domain/data/IVectorStore";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import type { DeleteLicitacaoDocumentDTO } from "./dtos/DeleteLicitacaoDocumentDTOs";
import { DeleteLicitacaoDocumentMapper, type DeleteLicitacaoDocumentView } from "./dtos/DeleteLicitacaoDocumentView";

export class DeleteLicitacaoDocument {
    constructor(
        private readonly documentRepository: PrismaDocumentRepository,
        private readonly objectStorageProvider: IObjectStorageProvider.Contract,
        private readonly vectorStore: IVectorStore.Contract,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
        private readonly config: DeleteLicitacaoDocument.Config,
    ) {}

    async execute(params: DeleteLicitacaoDocument.Params): Promise<DeleteLicitacaoDocument.Response> {
        await assertUserCanAccessCompany({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        const document = await this.documentRepository.findById({ id: params.documentId });
        if (!document) {
            throw new Error("Documento não encontrado.");
        }
        if (document.companyId !== params.companyId) {
            throw new Error("Você não tem acesso a este documento.");
        }

        await this.objectStorageProvider.deleteDocument({ key: document.storageKey }).catch(() => undefined);
        await this.vectorStore.deleteByFilter(this.config.vectorCollectionName, {
            must: [{ key: "document_id", match: { value: document.id } }],
        }).catch(() => undefined);
        await this.documentRepository.delete({ id: document.id });

        return DeleteLicitacaoDocumentMapper.toView(document.id);
    }
}

export namespace DeleteLicitacaoDocument {
    export type Config = {
        vectorCollectionName: string;
    };

    export type Params = DeleteLicitacaoDocumentDTO;
    export type Response = DeleteLicitacaoDocumentView;
}
