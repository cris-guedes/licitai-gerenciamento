/* eslint-disable @typescript-eslint/no-namespace */
import { DocumentAnalysisType } from "@prisma/client";
import { CloudflareR2ObjectStorageProvider } from "@/server/shared/infra/providers/storage/cloudflare-r2-object-storage-provider";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentAnalysisRepository } from "@/server/shared/infra/repositories/document-analysis.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserCanAccessDocument } from "../../_shared/assertDocumentAccess";
import { DocumentSummaryViewMapper } from "../../_shared/documentSummaryView";
import type { GetDocumentWorkspaceDTO } from "./dtos/GetDocumentWorkspaceDTOs";
import type { DocumentWorkspaceView } from "./dtos/GetDocumentWorkspaceView";

export class GetDocumentWorkspace {
    constructor(
        private readonly documentRepository: PrismaDocumentRepository,
        private readonly documentAnalysisRepository: PrismaDocumentAnalysisRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
        private readonly objectStorageProvider: CloudflareR2ObjectStorageProvider,
    ) {}

    async execute(params: GetDocumentWorkspace.Params): Promise<GetDocumentWorkspace.Response> {
        const { document } = await assertUserCanAccessDocument({
            documentRepository: this.documentRepository,
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            documentId: params.documentId,
            userId: params.userId,
        });

        const analyses = await this.documentAnalysisRepository.findLatestByDocumentIds({
            documentIds: [document.id],
            types: [DocumentAnalysisType.EXTRACT_EDITAL, DocumentAnalysisType.SUMMARY],
        });

        const temporaryUrl = await this.objectStorageProvider.getDocumentTemporaryUrl({
            key: document.storageKey,
            bucket: document.storageBucket,
            filename: document.originalName,
            contentType: document.mimeType,
        });

        const latestSummaryAnalysis = analyses.find(analysis => analysis.type === DocumentAnalysisType.SUMMARY) ?? null;
        const latestSummary = latestSummaryAnalysis
            ? DocumentSummaryViewMapper.fromAnalysisResult(latestSummaryAnalysis.result)
            : null;

        return {
            document: {
                id: document.id,
                companyId: document.companyId,
                type: document.type,
                title: document.originalName,
                originalName: document.originalName,
                mimeType: document.mimeType,
                sizeBytes: document.sizeBytes,
                status: document.status,
                uploadedAt: document.createdAt.toISOString(),
                updatedAt: document.updatedAt.toISOString(),
            },
            preview: {
                url: temporaryUrl.url,
                downloadUrl: temporaryUrl.url,
                expiresAt: temporaryUrl.expiresAt.toISOString(),
                filename: document.originalName,
                mimeType: document.mimeType,
            },
            processing: {
                state: document.status,
                canProcess: false,
                canRetry: document.status === "FAILED",
                errorMessage: document.status === "FAILED" ? "Falha no processamento do documento." : null,
                progress: null,
            },
            ai: {
                chat: {
                    enabled: document.status === "READY",
                    blockedReason: document.status === "READY" ? null : "Documento ainda nao foi processado.",
                    messageCount: null,
                },
                summary: {
                    enabled: document.status === "READY",
                    blockedReason: document.status === "READY" ? null : "Documento ainda nao foi processado.",
                    latest: latestSummary,
                },
                analyses: analyses.map(analysis => ({
                    id: analysis.id,
                    type: analysis.type,
                    status: analysis.status,
                    markdownContent: analysis.markdownContent,
                    result: analysis.result,
                    metrics: analysis.metrics,
                    errorMessage: analysis.errorMessage,
                    startedAt: analysis.startedAt?.toISOString() ?? null,
                    finishedAt: analysis.finishedAt?.toISOString() ?? null,
                    createdAt: analysis.createdAt.toISOString(),
                    updatedAt: analysis.updatedAt.toISOString(),
                })),
            },
            links: document.editalId
                ? [{ kind: "EDITAL", id: document.editalId, label: document.editalId, isPrimary: true }]
                : [{ kind: "AVULSO", id: document.id, label: "Documento avulso", isPrimary: true }],
        };
    }
}

export namespace GetDocumentWorkspace {
    export type Params = GetDocumentWorkspaceDTO;
    export type Response = DocumentWorkspaceView;
}
