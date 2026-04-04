export type UploadDocumentDTO = {
    orgId: string;
    companyId: string;
    editalId: string;
    type: string;
    publishedAt?: string | null;
    file: {
        name: string;
        type: string;
        size: number;
        buffer: Buffer;
    };
};
