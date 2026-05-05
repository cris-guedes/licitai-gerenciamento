/* eslint-disable @typescript-eslint/no-namespace */
import { DocumentStatus, DocumentType, EditalStatus, LicitacaoStatus } from "@prisma/client";
import type { IIdentifierProvider } from "@/server/modules/core-api/domain/data/IIdentifierProvider";
import type { IObjectStorageProvider } from "@/server/modules/core-api/domain/data/IObjectStorageProvider";
import type { IVectorStore } from "@/server/modules/core-api/domain/data/IVectorStore";
import type { PdfIngestionWorker } from "@/server/modules/core-api/workers/pdf-ingestion/PdfIngestionWorker";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaLicitacaoRepository } from "@/server/shared/infra/repositories/licitacao.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import type { UploadLicitacaoDocumentDTO } from "./dtos/UploadLicitacaoDocumentDTOs";
import { UploadLicitacaoDocumentMapper, type UploadLicitacaoDocumentView } from "./dtos/UploadLicitacaoDocumentView";

type ProgressEvent = {
    type: "progress";
    step: string;
    message: string;
    percent: number;
    status: "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
    context?: {
        licitacaoId: string;
        editalId: string;
        documentId: string;
        documentType: DocumentType;
    };
};

type ProgressPayload = Omit<ProgressEvent, "type">;

export class UploadLicitacaoDocument {
    constructor(
        private readonly identifierProvider: IIdentifierProvider,
        private readonly objectStorageProvider: IObjectStorageProvider.Contract,
        private readonly vectorStore: IVectorStore.Contract,
        private readonly pdfIngestionWorker: PdfIngestionWorker,
        private readonly licitacaoRepository: PrismaLicitacaoRepository,
        private readonly documentRepository: PrismaDocumentRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
        private readonly config: UploadLicitacaoDocument.Config,
    ) {}

    async execute(params: UploadLicitacaoDocument.Params): Promise<UploadLicitacaoDocument.Response> {
        const company = await assertUserCanAccessCompany({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        this.assertSupportedFile(params);

        const existingDocument = params.replaceDocumentId
            ? await this.documentRepository.findById({ id: params.replaceDocumentId })
            : null;

        if (params.replaceDocumentId && !existingDocument) {
            throw new Error("Documento a ser substituído não foi encontrado.");
        }

        if (existingDocument && existingDocument.companyId !== company.id) {
            throw new Error("Você não tem acesso a este documento.");
        }

        const context = await this.resolveDraftContext({
            companyId: company.id,
            createdById: params.createdById,
            licitacaoId: params.licitacaoId,
            editalId: params.editalId ?? existingDocument?.editalId ?? undefined,
        });

        const documentId = existingDocument?.id ?? this.identifierProvider.generate();
        const originalFilename = params.fileFilename.trim();
        const mimeType = params.fileMimeType?.trim() || "application/pdf";
        const logicalStorageKey = this.buildStorageKey({
            companyId: company.id,
            editalId: context.edital.id,
            documentId,
            fileName: originalFilename,
        });

        const send = params.onProgress ?? (() => undefined);

        send(this.createProgressEvent({
            step: "draft.ready",
            message: "Documento preparado para upload.",
            percent: 8,
            status: "UPLOADING",
            context: { licitacaoId: context.licitacao.id, editalId: context.edital.id, documentId, documentType: params.documentType },
        }));

        let storedDocument: IObjectStorageProvider.PutDocumentResponse | null = null;
        let persistedDocument: PrismaDocumentRepository.DocumentResponse | null = null;
        const previousStorageKey = existingDocument?.storageKey ?? null;

        try {
            send(this.createProgressEvent({
                step: "storage.upload",
                message: "Enviando documento para o armazenamento seguro.",
                percent: 16,
                status: "UPLOADING",
                context: { licitacaoId: context.licitacao.id, editalId: context.edital.id, documentId, documentType: params.documentType },
            }));

            storedDocument = await this.objectStorageProvider.putDocument({
                key: logicalStorageKey,
                body: params.fileBuffer,
                filename: originalFilename,
                contentType: mimeType,
                metadata: {
                    companyId: company.id,
                    editalId: context.edital.id,
                    documentId,
                    documentType: params.documentType,
                    ...(params.createdById ? { createdById: params.createdById } : {}),
                },
            });

            if (existingDocument) {
                persistedDocument = await this.documentRepository.update({
                    id: existingDocument.id,
                    data: {
                        editalId: context.edital.id,
                        type: params.documentType,
                        originalName: originalFilename,
                        mimeType,
                        sizeBytes: params.fileSizeBytes,
                        storageProvider: "cloudflare_r2",
                        storageBucket: storedDocument.bucket,
                        storageKey: storedDocument.storageKey,
                        storageUrl: storedDocument.url ?? `${storedDocument.bucket}/${storedDocument.storageKey}`,
                        vectorDocumentId: existingDocument.id,
                        vectorCollectionName: this.config.vectorCollectionName,
                        status: DocumentStatus.PROCESSING,
                    },
                });
            } else {
                persistedDocument = await this.documentRepository.create({
                    id: documentId,
                    companyId: company.id,
                    editalId: context.edital.id,
                    createdById: params.createdById,
                    type: params.documentType,
                    originalName: originalFilename,
                    mimeType,
                    sizeBytes: params.fileSizeBytes,
                    storageProvider: "cloudflare_r2",
                    storageBucket: storedDocument.bucket,
                    storageKey: storedDocument.storageKey,
                    storageUrl: storedDocument.url ?? `${storedDocument.bucket}/${storedDocument.storageKey}`,
                    vectorDocumentId: documentId,
                    vectorCollectionName: this.config.vectorCollectionName,
                    status: DocumentStatus.PROCESSING,
                });
            }

            await this.vectorStore.deleteByFilter(this.config.vectorCollectionName, {
                must: [{ key: "document_id", match: { value: documentId } }],
            });

            send(this.createProgressEvent({
                step: "processing.start",
                message: "Documento salvo. Iniciando parsing e indexação vetorial.",
                percent: 28,
                status: "PROCESSING",
                context: { licitacaoId: context.licitacao.id, editalId: context.edital.id, documentId, documentType: params.documentType },
            }));

            await this.pdfIngestionWorker.ingest(documentId, {
                pdfBuffer: params.fileBuffer,
                embeddingConcurrency: this.config.embeddingConcurrency,
                storeConcurrency: this.config.storeConcurrency,
                onProgress: {
                    onParsed: () => {
                        send(this.createProgressEvent({
                            step: "processing.parsed",
                            message: "Chunking concluído. Gerando embeddings do documento.",
                            percent: 54,
                            status: "PROCESSING",
                            context: { licitacaoId: context.licitacao.id, editalId: context.edital.id, documentId, documentType: params.documentType },
                        }));
                    },
                    onEmbedded: () => {
                        send(this.createProgressEvent({
                            step: "processing.embedded",
                            message: "Embeddings prontos. Indexando no acervo vetorial.",
                            percent: 76,
                            status: "PROCESSING",
                            context: { licitacaoId: context.licitacao.id, editalId: context.edital.id, documentId, documentType: params.documentType },
                        }));
                    },
                    onStored: () => {
                        send(this.createProgressEvent({
                            step: "processing.stored",
                            message: "Documento indexado com sucesso.",
                            percent: 92,
                            status: "PROCESSING",
                            context: { licitacaoId: context.licitacao.id, editalId: context.edital.id, documentId, documentType: params.documentType },
                        }));
                    },
                },
            });

            const document = await this.documentRepository.update({
                id: documentId,
                data: {
                    status: DocumentStatus.READY,
                },
            });

            if (previousStorageKey && previousStorageKey !== storedDocument.storageKey) {
                await this.objectStorageProvider.deleteDocument({ key: previousStorageKey }).catch(() => undefined);
            }

            const temporaryUrl = await this.objectStorageProvider.getDocumentTemporaryUrl({
                key: document.storageKey,
                bucket: document.storageBucket,
                filename: document.originalName,
                contentType: document.mimeType,
            });

            return UploadLicitacaoDocumentMapper.toView({
                licitacao: context.licitacao,
                edital: context.edital,
                document,
                documentUrl: temporaryUrl.url,
                previewUrlExpiresAt: temporaryUrl.expiresAt,
            });
        } catch (error) {
            if (persistedDocument) {
                await this.documentRepository.update({
                    id: persistedDocument.id,
                    data: { status: DocumentStatus.FAILED },
                }).catch(() => undefined);
            }

            if (!existingDocument && storedDocument) {
                await this.objectStorageProvider.deleteDocument({ key: storedDocument.storageKey }).catch(() => undefined);
            }

            throw error;
        }
    }

    private async resolveDraftContext(params: {
        companyId: string;
        createdById?: string;
        licitacaoId?: string;
        editalId?: string;
    }): Promise<UploadLicitacaoDocument.DraftContext> {
        if (params.licitacaoId && params.editalId) {
            return {
                licitacao: {
                    id: params.licitacaoId,
                    companyId: params.companyId,
                    createdById: params.createdById ?? null,
                    status: LicitacaoStatus.IN_PROGRESS,
                    metadados: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                edital: {
                    id: params.editalId,
                    licitacaoId: params.licitacaoId,
                    companyId: params.companyId,
                    createdById: params.createdById ?? null,
                    status: EditalStatus.IN_PROGRESS,
                    orgaoCnpj: null,
                    orgaoRazaoSocial: null,
                    orgaoEsfera: null,
                    orgaoPoder: null,
                    unidadeCodigo: null,
                    unidadeNome: null,
                    municipio: null,
                    uf: null,
                    numero: null,
                    processo: null,
                    modalidade: null,
                    tipoInstrumento: null,
                    modoDisputa: null,
                    amparoLegal: null,
                    srp: false,
                    objeto: null,
                    informacaoComplementar: null,
                    dataAbertura: null,
                    dataEncerramento: null,
                    valorEstimado: null,
                    dadosExtraidos: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            };
        }

        const licitacaoId = this.identifierProvider.generate();
        const editalId = this.identifierProvider.generate();

        return this.licitacaoRepository.createDraftWithEdital({
            licitacao: {
                id: licitacaoId,
                companyId: params.companyId,
                createdById: params.createdById,
                status: LicitacaoStatus.IN_PROGRESS,
            },
            edital: {
                id: editalId,
                companyId: params.companyId,
                createdById: params.createdById,
                status: EditalStatus.IN_PROGRESS,
            },
        });
    }

    private assertSupportedFile(params: UploadLicitacaoDocument.Params) {
        const hasPdfMimeType = (params.fileMimeType ?? "").toLowerCase() === "application/pdf";
        const hasPdfExtension = params.fileFilename.toLowerCase().endsWith(".pdf");

        if (!hasPdfMimeType && !hasPdfExtension) {
            throw new Error("Envie um arquivo PDF válido.");
        }
    }

    private buildStorageKey(params: { companyId: string; editalId: string; documentId: string; fileName: string }): string {
        const sanitizedName = params.fileName
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9._-]+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "")
            .toLowerCase();

        return `companies/${params.companyId}/editais/${params.editalId}/documents/${params.documentId}/${sanitizedName || "documento.pdf"}`;
    }

    private createProgressEvent(event: ProgressPayload): ProgressEvent {
        return {
            type: "progress",
            ...event,
        };
    }
}

export namespace UploadLicitacaoDocument {
    export type Config = {
        vectorCollectionName: string;
        embeddingConcurrency: number;
        storeConcurrency: number;
    };

    export type Params = UploadLicitacaoDocumentDTO & {
        onProgress?: (event: ProgressEvent) => void;
    };

    export type Response = UploadLicitacaoDocumentView;

    export type DraftContext = {
        licitacao: PrismaLicitacaoRepository.LicitacaoResponse;
        edital: PrismaLicitacaoRepository.EditalResponse;
    };
}
