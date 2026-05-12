import type { DocumentType } from "@prisma/client";

export interface UploadLicitacaoDocumentDTO {
    traceId?: string;
    companyId: string;
    userId: string;
    createdById?: string;
    oportunidadeId?: string;
    editalId?: string;
    replaceDocumentId?: string;
    documentType: DocumentType;
    fileBuffer: Buffer;
    fileFilename: string;
    fileMimeType?: string;
    fileSizeBytes: number;
}
