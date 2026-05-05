/* eslint-disable @typescript-eslint/no-namespace */
import { DocumentStatus, DocumentType, EditalStatus, LicitacaoStatus } from "@prisma/client";
import type { IIdentifierProvider } from "@/server/modules/core-api/domain/data/IIdentifierProvider";
import type { IObjectStorageProvider } from "@/server/modules/core-api/domain/data/IObjectStorageProvider";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaLicitacaoRepository } from "@/server/shared/infra/repositories/licitacao.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import type { UploadEditalDocumentDTO } from "./dtos/UploadEditalDocumentDTOs";
import { UploadEditalDocumentMapper, type UploadEditalDocumentView } from "./dtos/UploadEditalDocumentView";

export class UploadEditalDocument {
    constructor(
        private readonly identifierProvider: IIdentifierProvider,
        private readonly objectStorageProvider: IObjectStorageProvider.Contract,
        private readonly licitacaoRepository: PrismaLicitacaoRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
        private readonly config: UploadEditalDocument.Config,
    ) {}

    async execute(params: UploadEditalDocument.Params): Promise<UploadEditalDocument.Response> {
        const company = await assertUserCanAccessCompany({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        this.assertSupportedFile(params);

        const documentId = this.identifierProvider.generate();
        const licitacaoId = this.identifierProvider.generate();
        const editalId = this.identifierProvider.generate();
        const originalFilename = params.fileFilename.trim();
        const mimeType = params.fileMimeType?.trim() || "application/pdf";
        const logicalStorageKey = this.buildStorageKey(company.id, documentId);

        let storedDocument: IObjectStorageProvider.PutDocumentResponse | null = null;

        try {
            storedDocument = await this.objectStorageProvider.putDocument({
                key: logicalStorageKey,
                body: params.fileBuffer,
                filename: originalFilename,
                contentType: mimeType,
                metadata: {
                    companyId: company.id,
                    documentId,
                    documentType: "edital",
                    ...(params.createdById ? { createdById: params.createdById } : {}),
                },
            });

            const { document, edital, licitacao } = await this.licitacaoRepository.createDraftWithEditalAndDocument({
                licitacao: {
                    id: licitacaoId,
                    companyId: company.id,
                    createdById: params.createdById,
                    status: LicitacaoStatus.IN_PROGRESS,
                },
                edital: {
                    id: editalId,
                    companyId: company.id,
                    createdById: params.createdById,
                    status: EditalStatus.IN_PROGRESS,
                },
                document: {
                    id: documentId,
                    companyId: company.id,
                    createdById: params.createdById,
                    type: DocumentType.EDITAL,
                    originalName: originalFilename,
                    mimeType,
                    sizeBytes: params.fileSizeBytes,
                    storageProvider: "cloudflare_r2",
                    storageBucket: storedDocument.bucket,
                    storageKey: storedDocument.storageKey,
                    storageUrl: storedDocument.url ?? `${storedDocument.bucket}/${storedDocument.storageKey}`,
                    vectorDocumentId: documentId,
                    vectorCollectionName: this.config.vectorCollectionName,
                    status: DocumentStatus.READY,
                },
            });

            const temporaryUrl = await this.objectStorageProvider.getDocumentTemporaryUrl({
                key: document.storageKey,
                bucket: document.storageBucket,
                filename: document.originalName,
                contentType: document.mimeType,
            });

            return UploadEditalDocumentMapper.toView({
                licitacao,
                edital,
                document,
                documentUrl: temporaryUrl.url,
                previewUrlExpiresAt: temporaryUrl.expiresAt,
            });
        } catch (error) {
            if (storedDocument) {
                await this.objectStorageProvider.deleteDocument({ key: logicalStorageKey }).catch(() => undefined);
            }

            throw error;
        }
    }

    private assertSupportedFile(params: UploadEditalDocument.Params) {
        const hasPdfMimeType = (params.fileMimeType ?? "").toLowerCase() === "application/pdf";
        const hasPdfExtension = params.fileFilename.toLowerCase().endsWith(".pdf");

        if (!hasPdfMimeType && !hasPdfExtension) {
            throw new Error("Envie um arquivo PDF válido para o edital.");
        }
    }

    private buildStorageKey(companyId: string, documentId: string): string {
        return `companies/${companyId}/documents/${documentId}/edital.pdf`;
    }
}

export namespace UploadEditalDocument {
    export type Config = {
        vectorCollectionName: string;
    };

    export type Params = UploadEditalDocumentDTO;
    export type Response = UploadEditalDocumentView;
}
