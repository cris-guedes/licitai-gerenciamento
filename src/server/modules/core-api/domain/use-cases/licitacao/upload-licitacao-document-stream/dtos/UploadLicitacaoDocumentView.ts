import type { DocumentType } from "@prisma/client";
import type { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import type { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { parseLicitacaoDraftPreview, type LicitacaoDraftPreview } from "../../_shared/draftPreview";

export type UploadLicitacaoDocumentView = {
    oportunidadeId: string;
    oportunidadeStatus: "DRAFT" | "ACTIVE" | "CANCELLED";
    licitacaoId: string | null;
    licitacaoStatus: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | null;
    editalId: string | null;
    editalStatus: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | null;
    documentId: string;
    documentType: DocumentType;
    displayName: string | null;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    status: "PROCESSING" | "READY" | "FAILED";
    documentUrl: string;
    previewUrl: string;
    previewUrlExpiresAt: string;
    uploadedAt: string;
    draftPreview: LicitacaoDraftPreview | null;
};

export class UploadLicitacaoDocumentMapper {
    static toView(params: {
        oportunidade: PrismaOportunidadeRepository.OportunidadeResponse;
        licitacao: PrismaOportunidadeRepository.LicitacaoResponse;
        edital: PrismaOportunidadeRepository.EditalResponse;
        document: PrismaDocumentRepository.DocumentResponse;
        documentUrl: string;
        previewUrlExpiresAt: Date;
    }): UploadLicitacaoDocumentView {
        const draftPreview = parseLicitacaoDraftPreview(params.oportunidade.metadata ?? params.licitacao.metadados);

        return {
            oportunidadeId: params.oportunidade.id,
            oportunidadeStatus: params.oportunidade.status,
            licitacaoId: params.licitacao.id,
            licitacaoStatus: params.licitacao.status,
            editalId: params.edital.id,
            editalStatus: params.edital.status,
            documentId: params.document.id,
            documentType: params.document.type,
            displayName: draftPreview?.sourceDocumentId === params.document.id ? draftPreview.displayName : null,
            originalName: params.document.originalName,
            mimeType: params.document.mimeType,
            sizeBytes: params.document.sizeBytes,
            status: params.document.status,
            documentUrl: params.documentUrl,
            previewUrl: params.documentUrl,
            previewUrlExpiresAt: params.previewUrlExpiresAt.toISOString(),
            uploadedAt: params.document.updatedAt.toISOString(),
            draftPreview,
        };
    }
}
