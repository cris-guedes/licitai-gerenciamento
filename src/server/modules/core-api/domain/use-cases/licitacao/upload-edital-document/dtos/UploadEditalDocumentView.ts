import type { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import type { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { parseLicitacaoDraftPreview, type LicitacaoDraftPreview } from "../../_shared/draftPreview";

export type UploadEditalDocumentView = {
    oportunidadeId: string;
    oportunidadeStatus: "DRAFT";
    licitacaoId: string;
    licitacaoStatus: "IN_PROGRESS";
    editalId: string;
    editalStatus: "IN_PROGRESS";
    documentId: string;
    documentType: "edital";
    displayName: string | null;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    status: "READY";
    documentUrl: string;
    previewUrl: string;
    previewUrlExpiresAt: string;
    uploadedAt: string;
    draftPreview: LicitacaoDraftPreview | null;
};

export class UploadEditalDocumentMapper {
    static toView(params: {
        oportunidade: PrismaOportunidadeRepository.OportunidadeResponse;
        licitacao: PrismaOportunidadeRepository.LicitacaoResponse;
        edital: PrismaOportunidadeRepository.EditalResponse;
        document: PrismaDocumentRepository.DocumentResponse;
        documentUrl: string;
        previewUrlExpiresAt: Date;
    }): UploadEditalDocumentView {
        const draftPreview = parseLicitacaoDraftPreview(params.oportunidade.metadata ?? params.licitacao.metadados);

        return {
            oportunidadeId: params.oportunidade.id,
            oportunidadeStatus: "DRAFT",
            licitacaoId: params.licitacao.id,
            licitacaoStatus: "IN_PROGRESS",
            editalId: params.edital.id,
            editalStatus: "IN_PROGRESS",
            documentId: params.document.id,
            documentType: "edital",
            displayName: draftPreview?.sourceDocumentId === params.document.id ? draftPreview.displayName : null,
            originalName: params.document.originalName,
            mimeType: params.document.mimeType,
            sizeBytes: params.document.sizeBytes,
            status: "READY",
            documentUrl: params.documentUrl,
            previewUrl: params.documentUrl,
            previewUrlExpiresAt: params.previewUrlExpiresAt.toISOString(),
            uploadedAt: params.document.createdAt.toISOString(),
            draftPreview,
        };
    }
}
