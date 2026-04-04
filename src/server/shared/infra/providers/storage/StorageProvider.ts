export interface StorageProvider {
    upload(params: StorageProvider.UploadParams): Promise<string>;
}

export namespace StorageProvider {
    export type UploadParams = {
        key: string;
        buffer: Buffer;
        contentType: string;
    };
}
