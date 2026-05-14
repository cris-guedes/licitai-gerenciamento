import type { DocumentAnalysisStatus, DocumentAnalysisType, DocumentStatus, DocumentType, Prisma } from "@prisma/client";
import type { DocumentSummaryView } from "../../../_shared/documentSummaryView";

export type DocumentWorkspaceAnalysisView = {
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

export type DocumentWorkspaceView = {
    document: {
        id: string;
        companyId: string;
        type: DocumentType;
        title: string;
        originalName: string;
        mimeType: string;
        sizeBytes: number;
        status: DocumentStatus;
        uploadedAt: string;
        updatedAt: string;
    };
    preview: {
        url: string;
        downloadUrl: string;
        expiresAt: string;
        filename: string;
        mimeType: string;
    };
    processing: {
        state: "PROCESSING" | "READY" | "FAILED";
        canProcess: boolean;
        canRetry: boolean;
        errorMessage: string | null;
        progress: null;
    };
    ai: {
        chat: {
            enabled: boolean;
            blockedReason: string | null;
            messageCount: number | null;
        };
        summary: {
            enabled: boolean;
            blockedReason: string | null;
            latest: DocumentSummaryView | null;
        };
        analyses: DocumentWorkspaceAnalysisView[];
    };
    links: Array<{
        kind: "AVULSO" | "EDITAL";
        id: string;
        label: string;
        isPrimary: boolean;
    }>;
};
