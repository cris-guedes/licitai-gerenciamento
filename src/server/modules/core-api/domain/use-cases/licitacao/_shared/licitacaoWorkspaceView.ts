import type { DocumentAnalysisStatus, DocumentAnalysisType, DocumentStatus, DocumentType, EditalStatus, LicitacaoStatus, Prisma } from "@prisma/client";
import type { PrismaDocumentAnalysisRepository } from "@/server/shared/infra/repositories/document-analysis.repository";
import type { PrismaLicitacaoRepository } from "@/server/shared/infra/repositories/licitacao.repository";
import { parseLicitacaoDraftPreview, type LicitacaoDraftPreview } from "./draftPreview";

export type LicitacaoDraftSummaryView = {
    licitacaoId: string;
    licitacaoStatus: LicitacaoStatus;
    editalId: string | null;
    editalStatus: EditalStatus | null;
    primaryDocumentName: string | null;
    primaryDocumentType: DocumentType | null;
    draftPreview: LicitacaoDraftPreview | null;
    documentCount: number;
    readyDocuments: number;
    processingDocuments: number;
    failedDocuments: number;
    createdAt: string;
    updatedAt: string;
};

export type LicitacaoWorkspaceAnalysisView = {
    id: string;
    type: DocumentAnalysisType;
    status: DocumentAnalysisStatus;
    markdownContent: string | null;
    result: Prisma.JsonValue | null;
    metrics: Prisma.JsonValue | null;
    errorMessage: string | null;
    startedAt: string | null;
    finishedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type LicitacaoWorkspaceDocumentView = {
    id: string;
    type: DocumentType;
    displayName: string | null;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    status: DocumentStatus;
    documentUrl: string;
    previewUrl: string;
    previewUrlExpiresAt: string;
    uploadedAt: string;
    analyses: LicitacaoWorkspaceAnalysisView[];
};

export type LicitacaoWorkspaceView = {
    licitacao: {
        id: string;
        status: LicitacaoStatus;
        draftPreview: LicitacaoDraftPreview | null;
        createdAt: string;
        updatedAt: string;
    };
    edital: {
        id: string;
        status: EditalStatus;
        createdAt: string;
        updatedAt: string;
    } | null;
    documents: LicitacaoWorkspaceDocumentView[];
};

export class LicitacaoWorkspaceViewMapper {
    static toDraftSummary(
        draft: PrismaLicitacaoRepository.LicitacaoDraftRecord,
    ): LicitacaoDraftSummaryView {
        const draftPreview = parseLicitacaoDraftPreview(draft.metadados);
        const documents = draft.edital?.documents ?? [];
        const primaryDocument = documents.find(document => document.type === "EDITAL") ?? documents[0] ?? null;

        return {
            licitacaoId: draft.id,
            licitacaoStatus: draft.status,
            editalId: draft.edital?.id ?? null,
            editalStatus: draft.edital?.status ?? null,
            primaryDocumentName: draftPreview?.displayName ?? primaryDocument?.originalName ?? null,
            primaryDocumentType: primaryDocument?.type ?? null,
            draftPreview,
            documentCount: documents.length,
            readyDocuments: documents.filter(document => document.status === "READY").length,
            processingDocuments: documents.filter(document => document.status === "PROCESSING").length,
            failedDocuments: documents.filter(document => document.status === "FAILED").length,
            createdAt: draft.createdAt.toISOString(),
            updatedAt: draft.updatedAt.toISOString(),
        };
    }

    static toWorkspaceView(params: {
        workspace: PrismaLicitacaoRepository.LicitacaoWorkspaceRecord;
        analysesByDocumentId: Map<string, PrismaDocumentAnalysisRepository.DocumentAnalysisResponse[]>;
        urlsByDocumentId: Map<string, { documentUrl: string; previewUrlExpiresAt: Date }>;
    }): LicitacaoWorkspaceView {
        const draftPreview = parseLicitacaoDraftPreview(params.workspace.metadados);

        return {
            licitacao: {
                id: params.workspace.id,
                status: params.workspace.status,
                draftPreview,
                createdAt: params.workspace.createdAt.toISOString(),
                updatedAt: params.workspace.updatedAt.toISOString(),
            },
            edital: params.workspace.edital
                ? {
                    id: params.workspace.edital.id,
                    status: params.workspace.edital.status,
                    createdAt: params.workspace.edital.createdAt.toISOString(),
                    updatedAt: params.workspace.edital.updatedAt.toISOString(),
                }
                : null,
            documents: (params.workspace.edital?.documents ?? []).map(document => this.toDocumentView({
                document,
                analyses: params.analysesByDocumentId.get(document.id) ?? [],
                urls: params.urlsByDocumentId.get(document.id),
                draftPreview,
            })),
        };
    }

    private static toDocumentView(params: {
        document: PrismaLicitacaoRepository.DraftDocumentRecord;
        analyses: PrismaDocumentAnalysisRepository.DocumentAnalysisResponse[];
        urls?: { documentUrl: string; previewUrlExpiresAt: Date };
        draftPreview: LicitacaoDraftPreview | null;
    }): LicitacaoWorkspaceDocumentView {
        return {
            id: params.document.id,
            type: params.document.type as DocumentType,
            displayName: params.draftPreview?.sourceDocumentId === params.document.id
                ? params.draftPreview.displayName
                : null,
            originalName: params.document.originalName,
            mimeType: params.document.mimeType,
            sizeBytes: params.document.sizeBytes,
            status: params.document.status as DocumentStatus,
            documentUrl: params.urls?.documentUrl ?? "",
            previewUrl: params.urls?.documentUrl ?? "",
            previewUrlExpiresAt: params.urls?.previewUrlExpiresAt.toISOString() ?? new Date(0).toISOString(),
            uploadedAt: params.document.updatedAt.toISOString(),
            analyses: params.analyses.map(analysis => this.toAnalysisView(analysis)),
        };
    }

    private static toAnalysisView(
        analysis: PrismaDocumentAnalysisRepository.DocumentAnalysisResponse,
    ): LicitacaoWorkspaceAnalysisView {
        return {
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
        };
    }
}
