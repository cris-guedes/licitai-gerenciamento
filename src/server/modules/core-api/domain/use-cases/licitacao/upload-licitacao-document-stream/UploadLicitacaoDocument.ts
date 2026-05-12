/* eslint-disable @typescript-eslint/no-namespace */
import { DocumentStatus, DocumentType, EditalStatus, LicitacaoStatus } from "@prisma/client";
import type { IIdentifierProvider } from "@/server/modules/core-api/domain/data/IIdentifierProvider";
import type { IObjectStorageProvider } from "@/server/modules/core-api/domain/data/IObjectStorageProvider";
import type { IVectorStore } from "@/server/modules/core-api/domain/data/IVectorStore";
import type { PdfIngestionWorker } from "@/server/modules/core-api/workers/pdf-ingestion/PdfIngestionWorker";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import { DraftPreviewExtractor } from "../_shared/DraftPreviewExtractor";
import { withDraftPreview } from "../_shared/draftPreview";
import type { UploadLicitacaoDocumentDTO } from "./dtos/UploadLicitacaoDocumentDTOs";
import { UploadLicitacaoDocumentMapper, type UploadLicitacaoDocumentView } from "./dtos/UploadLicitacaoDocumentView";

type ProgressEvent = {
    type: "progress";
    step: string;
    message: string;
    percent: number;
    status: "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
    context?: {
        oportunidadeId: string;
        licitacaoId: string | null;
        editalId: string | null;
        documentId: string;
        documentType: DocumentType;
    };
};

type ProgressPayload = Omit<ProgressEvent, "type">;

function serializeError(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: error.cause,
        };
    }

    return { message: String(error) };
}

function logUpload(traceId: string | undefined, message: string, data?: Record<string, unknown>) {
    console.info(`[UploadLicitacaoDocument:${traceId ?? "no-trace"}] ${message}`, data ?? {});
}

function logUploadError(traceId: string | undefined, message: string, error: unknown, data?: Record<string, unknown>) {
    console.error(`[UploadLicitacaoDocument:${traceId ?? "no-trace"}] ${message}`, {
        ...data,
        ...serializeError(error),
    });
}

export class UploadLicitacaoDocument {
    constructor(
        private readonly identifierProvider: IIdentifierProvider,
        private readonly objectStorageProvider: IObjectStorageProvider.Contract,
        private readonly vectorStore: IVectorStore.Contract,
        private readonly pdfIngestionWorker: PdfIngestionWorker,
        private readonly oportunidadeRepository: PrismaOportunidadeRepository,
        private readonly documentRepository: PrismaDocumentRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
        private readonly draftPreviewExtractor: DraftPreviewExtractor,
        private readonly config: UploadLicitacaoDocument.Config,
    ) {}

    async execute(params: UploadLicitacaoDocument.Params): Promise<UploadLicitacaoDocument.Response> {
        const startedAt = Date.now();
        const traceId = params.traceId;
        let stage = "access.check";

        logUpload(traceId, "execute.started", {
            companyId: params.companyId,
            oportunidadeId: params.oportunidadeId,
            editalId: params.editalId,
            replaceDocumentId: params.replaceDocumentId,
            documentType: params.documentType,
            fileFilename: params.fileFilename,
            fileMimeType: params.fileMimeType,
            fileSizeBytes: params.fileSizeBytes,
        });

        const accessStartedAt = Date.now();
        const company = await assertUserCanAccessCompany({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });
        logUpload(traceId, "access.ready", {
            companyId: company.id,
            durationMs: Date.now() - accessStartedAt,
        });

        stage = "file.validation";
        this.assertSupportedFile(params);
        logUpload(traceId, "file.validated", {
            filename: params.fileFilename,
            mimeType: params.fileMimeType,
            sizeBytes: params.fileSizeBytes,
        });

        stage = "document.lookup";
        const existingDocumentStartedAt = Date.now();
        const existingDocument = params.replaceDocumentId
            ? await this.documentRepository.findById({ id: params.replaceDocumentId })
            : null;
        logUpload(traceId, "document.lookup.done", {
            replaceDocumentId: params.replaceDocumentId,
            found: Boolean(existingDocument),
            durationMs: Date.now() - existingDocumentStartedAt,
        });

        if (params.replaceDocumentId && !existingDocument) {
            throw new Error("Documento a ser substituído não foi encontrado.");
        }

        if (existingDocument && existingDocument.companyId !== company.id) {
            throw new Error("Você não tem acesso a este documento.");
        }

        stage = "draft.resolve";
        const contextStartedAt = Date.now();
        const context = await this.resolveDraftContext({
            companyId: company.id,
            createdById: params.createdById,
            oportunidadeId: params.oportunidadeId,
            editalId: params.editalId ?? existingDocument?.editalId ?? undefined,
        });
        logUpload(traceId, "draft.ready", {
            oportunidadeId: context.oportunidade.id,
            licitacaoId: context.licitacao.id,
            editalId: context.edital.id,
            durationMs: Date.now() - contextStartedAt,
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
            context: {
                oportunidadeId: context.oportunidade.id,
                licitacaoId: context.licitacao.id,
                editalId: context.edital.id,
                documentId,
                documentType: params.documentType,
            },
        }));

        let storedDocument: IObjectStorageProvider.PutDocumentResponse | null = null;
        let persistedDocument: PrismaDocumentRepository.DocumentResponse | null = null;
        const previousStorageKey = existingDocument?.storageKey ?? null;

        try {
            stage = "storage.upload";
            send(this.createProgressEvent({
                step: "storage.upload",
                message: "Enviando documento para o armazenamento seguro.",
                percent: 16,
                status: "UPLOADING",
                context: {
                    oportunidadeId: context.oportunidade.id,
                    licitacaoId: context.licitacao.id,
                    editalId: context.edital.id,
                    documentId,
                    documentType: params.documentType,
                },
            }));

            const storageStartedAt = Date.now();
            logUpload(traceId, "storage.upload.started", {
                documentId,
                key: logicalStorageKey,
                bytes: params.fileBuffer.byteLength,
            });

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
            logUpload(traceId, "storage.upload.done", {
                documentId,
                bucket: storedDocument.bucket,
                storageKey: storedDocument.storageKey,
                sizeBytes: storedDocument.sizeBytes,
                durationMs: Date.now() - storageStartedAt,
            });

            stage = existingDocument ? "document.update" : "document.create";
            const persistStartedAt = Date.now();
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
            logUpload(traceId, "document.persisted", {
                documentId: persistedDocument.id,
                status: persistedDocument.status,
                durationMs: Date.now() - persistStartedAt,
            });

            stage = "vector.cleanup";
            const vectorCleanupStartedAt = Date.now();
            logUpload(traceId, "vector.cleanup.started", {
                collectionName: this.config.vectorCollectionName,
                documentId,
            });
            await this.vectorStore.deleteByFilter(this.config.vectorCollectionName, {
                must: [{ key: "document_id", match: { value: documentId } }],
            });
            logUpload(traceId, "vector.cleanup.done", {
                documentId,
                durationMs: Date.now() - vectorCleanupStartedAt,
            });

            stage = "processing.ingest";
            send(this.createProgressEvent({
                step: "processing.start",
                message: "Documento salvo. Iniciando parsing e indexação vetorial.",
                percent: 28,
                status: "PROCESSING",
                context: {
                    oportunidadeId: context.oportunidade.id,
                    licitacaoId: context.licitacao.id,
                    editalId: context.edital.id,
                    documentId,
                    documentType: params.documentType,
                },
            }));

            const draftPreviewPromise = this.shouldExtractDraftPreview(params.documentType)
                ? this.generateDraftPreview({
                    traceId,
                    documentId,
                    oportunidadeId: context.oportunidade.id,
                    currentMetadata: context.oportunidade.metadata,
                    pdfBuffer: params.fileBuffer,
                    filename: originalFilename,
                })
                : Promise.resolve(null);

            const ingestionStartedAt = Date.now();
            logUpload(traceId, "ingestion.started", {
                documentId,
                bytes: params.fileBuffer.byteLength,
                embeddingConcurrency: this.config.embeddingConcurrency,
                storeConcurrency: this.config.storeConcurrency,
            });
            await this.pdfIngestionWorker.ingest(documentId, {
                pdfBuffer: params.fileBuffer,
                traceId,
                embeddingConcurrency: this.config.embeddingConcurrency,
                storeConcurrency: this.config.storeConcurrency,
                onProgress: {
                    onParsed: () => {
                        send(this.createProgressEvent({
                            step: "processing.parsed",
                            message: "Chunking concluído. Gerando embeddings do documento.",
                            percent: 54,
                            status: "PROCESSING",
                            context: {
                                oportunidadeId: context.oportunidade.id,
                                licitacaoId: context.licitacao.id,
                                editalId: context.edital.id,
                                documentId,
                                documentType: params.documentType,
                            },
                        }));
                    },
                    onEmbedded: () => {
                        send(this.createProgressEvent({
                            step: "processing.embedded",
                            message: "Embeddings prontos. Indexando no acervo vetorial.",
                            percent: 76,
                            status: "PROCESSING",
                            context: {
                                oportunidadeId: context.oportunidade.id,
                                licitacaoId: context.licitacao.id,
                                editalId: context.edital.id,
                                documentId,
                                documentType: params.documentType,
                            },
                        }));
                    },
                    onStored: () => {
                        send(this.createProgressEvent({
                            step: "processing.stored",
                            message: "Documento indexado com sucesso.",
                            percent: 92,
                            status: "PROCESSING",
                            context: {
                                oportunidadeId: context.oportunidade.id,
                                licitacaoId: context.licitacao.id,
                                editalId: context.edital.id,
                                documentId,
                                documentType: params.documentType,
                            },
                        }));
                    },
                },
            });
            logUpload(traceId, "ingestion.done", {
                documentId,
                durationMs: Date.now() - ingestionStartedAt,
            });

            stage = "document.ready";
            const readyStartedAt = Date.now();
            const document = await this.documentRepository.update({
                id: documentId,
                data: {
                    status: DocumentStatus.READY,
                },
            });
            logUpload(traceId, "document.ready", {
                documentId,
                status: document.status,
                durationMs: Date.now() - readyStartedAt,
            });

            stage = "draft.preview.await";
            const oportunidade = await draftPreviewPromise;
            logUpload(traceId, "draft.preview.awaited", {
                updated: Boolean(oportunidade),
            });

            if (previousStorageKey && previousStorageKey !== storedDocument.storageKey) {
                stage = "storage.previous.delete";
                await this.objectStorageProvider.deleteDocument({ key: previousStorageKey }).catch(() => undefined);
            }

            stage = "temporary_url.create";
            const urlStartedAt = Date.now();
            const temporaryUrl = await this.objectStorageProvider.getDocumentTemporaryUrl({
                key: document.storageKey,
                bucket: document.storageBucket,
                filename: document.originalName,
                contentType: document.mimeType,
            });
            logUpload(traceId, "temporary_url.created", {
                documentId,
                expiresAt: temporaryUrl.expiresAt.toISOString(),
                durationMs: Date.now() - urlStartedAt,
            });

            const response = UploadLicitacaoDocumentMapper.toView({
                oportunidade: oportunidade ?? context.oportunidade,
                licitacao: context.licitacao,
                edital: context.edital,
                document,
                documentUrl: temporaryUrl.url,
                previewUrlExpiresAt: temporaryUrl.expiresAt,
            });
            logUpload(traceId, "execute.done", {
                documentId,
                elapsedMs: Date.now() - startedAt,
            });

            return response;
        } catch (error) {
            logUploadError(traceId, "execute.failed", error, {
                stage,
                documentId,
                elapsedMs: Date.now() - startedAt,
            });

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
        oportunidadeId?: string;
        editalId?: string;
    }): Promise<UploadLicitacaoDocument.DraftContext> {
        if (params.oportunidadeId) {
            const workspace = await this.oportunidadeRepository.findWorkspaceById({
                oportunidadeId: params.oportunidadeId,
                companyId: params.companyId,
            });

            if (!workspace || !workspace.edital || !workspace.licitacao) {
                throw new Error("O rascunho da licitação informado não foi encontrado.");
            }

            if (params.editalId && workspace.edital.id !== params.editalId) {
                throw new Error("O rascunho da licitação informado não foi encontrado.");
            }

            return {
                oportunidade: workspace,
                licitacao: workspace.licitacao,
                edital: workspace.edital,
            };
        }

        const oportunidadeId = this.identifierProvider.generate();
        const licitacaoId = this.identifierProvider.generate();
        const editalId = this.identifierProvider.generate();

        return this.oportunidadeRepository.createDraftWithLicitacaoEdital({
            oportunidade: {
                id: oportunidadeId,
                companyId: params.companyId,
                responsavelUserId: params.createdById,
                status: "DRAFT",
            },
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
        }).then(result => ({
            oportunidade: result.oportunidade,
            licitacao: result.licitacao,
            edital: result.edital,
        }));
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

    private shouldExtractDraftPreview(documentType: DocumentType) {
        return documentType === DocumentType.EDITAL;
    }

    private async generateDraftPreview(params: {
        traceId?: string;
        documentId: string;
        oportunidadeId: string;
        currentMetadata: PrismaOportunidadeRepository.OportunidadeResponse["metadata"];
        pdfBuffer: Buffer;
        filename: string;
    }) {
        try {
            const startedAt = Date.now();
            logUpload(params.traceId, "draft.preview.started", {
                documentId: params.documentId,
                filename: params.filename,
            });
            const draftPreview = await this.draftPreviewExtractor.extract({
                documentId: params.documentId,
                pdfBuffer: params.pdfBuffer,
                filename: params.filename,
            });

            if (!draftPreview) {
                logUpload(params.traceId, "draft.preview.empty", {
                    documentId: params.documentId,
                    durationMs: Date.now() - startedAt,
                });
                return null;
            }

            const oportunidade = await this.oportunidadeRepository.update({
                id: params.oportunidadeId,
                data: {
                    metadata: withDraftPreview(params.currentMetadata, draftPreview),
                },
            });
            logUpload(params.traceId, "draft.preview.done", {
                documentId: params.documentId,
                durationMs: Date.now() - startedAt,
            });

            return oportunidade;
        } catch (error) {
            console.warn(`[UploadLicitacaoDocument:${params.traceId ?? "no-trace"}] draft.preview.failed`, serializeError(error));
            return null;
        }
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
        oportunidade: PrismaOportunidadeRepository.OportunidadeResponse;
        licitacao: PrismaOportunidadeRepository.LicitacaoResponse;
        edital: PrismaOportunidadeRepository.EditalResponse;
    };
}
