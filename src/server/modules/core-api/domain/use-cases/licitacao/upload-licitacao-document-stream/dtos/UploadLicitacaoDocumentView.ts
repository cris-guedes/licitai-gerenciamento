import type { DocumentType } from "@prisma/client";
import type { PrismaLicitacaoRepository } from "@/server/shared/infra/repositories/licitacao.repository";
import type { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";

export type UploadLicitacaoDocumentView = {
    licitacaoId: string;
    licitacaoStatus: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    editalId: string;
    editalStatus: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    documentId: string;
    documentType: DocumentType;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    status: "PROCESSING" | "READY" | "FAILED";
    documentUrl: string;
    previewUrl: string;
    previewUrlExpiresAt: string;
    uploadedAt: string;
};

export class UploadLicitacaoDocumentMapper {
    static toView(params: {
        licitacao: PrismaLicitacaoRepository.LicitacaoResponse;
        edital: PrismaLicitacaoRepository.EditalResponse;
        document: PrismaDocumentRepository.DocumentResponse;
        documentUrl: string;
        previewUrlExpiresAt: Date;
    }): UploadLicitacaoDocumentView {
        return {
            licitacaoId: params.licitacao.id,
            licitacaoStatus: params.licitacao.status,
            editalId: params.edital.id,
            editalStatus: params.edital.status,
            documentId: params.document.id,
            documentType: params.document.type,
            originalName: params.document.originalName,
            mimeType: params.document.mimeType,
            sizeBytes: params.document.sizeBytes,
            status: params.document.status,
            documentUrl: params.documentUrl,
            previewUrl: params.documentUrl,
            previewUrlExpiresAt: params.previewUrlExpiresAt.toISOString(),
            uploadedAt: params.document.updatedAt.toISOString(),
        };
    }
}
