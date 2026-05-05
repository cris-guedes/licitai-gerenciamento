import type { DocumentType } from "@prisma/client";

export interface UploadLicitacaoDocumentDTO {
    companyId: string;
    userId: string;
    createdById?: string;
    licitacaoId?: string;
    editalId?: string;
    replaceDocumentId?: string;
    documentType: DocumentType;
    fileBuffer: Buffer;
    fileFilename: string;
    fileMimeType?: string;
    fileSizeBytes: number;
}
