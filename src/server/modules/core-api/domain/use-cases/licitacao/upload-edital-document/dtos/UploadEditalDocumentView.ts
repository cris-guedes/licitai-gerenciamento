import type { PrismaLicitacaoRepository } from "@/server/shared/infra/repositories/licitacao.repository";
import type { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";

export type UploadEditalDocumentView = {
    licitacaoId: string;
    licitacaoStatus: "IN_PROGRESS";
    editalId: string;
    editalStatus: "IN_PROGRESS";
    documentId: string;
    documentType: "edital";
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    status: "READY";
    documentUrl: string;
    previewUrl: string;
    previewUrlExpiresAt: string;
    uploadedAt: string;
};

export class UploadEditalDocumentMapper {
    static toView(params: {
        licitacao: PrismaLicitacaoRepository.LicitacaoResponse;
        edital: PrismaLicitacaoRepository.EditalResponse;
        document: PrismaDocumentRepository.DocumentResponse;
        documentUrl: string;
        previewUrlExpiresAt: Date;
    }): UploadEditalDocumentView {
        return {
            licitacaoId: params.licitacao.id,
            licitacaoStatus: "IN_PROGRESS",
            editalId: params.edital.id,
            editalStatus: "IN_PROGRESS",
            documentId: params.document.id,
            documentType: "edital",
            originalName: params.document.originalName,
            mimeType: params.document.mimeType,
            sizeBytes: params.document.sizeBytes,
            status: "READY",
            documentUrl: params.documentUrl,
            previewUrl: params.documentUrl,
            previewUrlExpiresAt: params.previewUrlExpiresAt.toISOString(),
            uploadedAt: params.document.createdAt.toISOString(),
        };
    }
}
