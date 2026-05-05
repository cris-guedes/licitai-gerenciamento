export interface UploadEditalDocumentDTO {
    companyId: string;
    userId: string;
    createdById?: string;
    fileBuffer: Buffer;
    fileFilename: string;
    fileMimeType?: string;
    fileSizeBytes: number;
}
