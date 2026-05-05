/* eslint-disable @typescript-eslint/no-namespace */
export interface IObjectStorageProvider {
    putDocument(
        params: IObjectStorageProvider.PutDocumentParams,
    ): Promise<IObjectStorageProvider.PutDocumentResponse>;

    getDocument(
        params: IObjectStorageProvider.GetDocumentParams,
    ): Promise<IObjectStorageProvider.GetDocumentResponse | null>;

    getDocumentMetadata(
        params: IObjectStorageProvider.GetDocumentMetadataParams,
    ): Promise<IObjectStorageProvider.GetDocumentMetadataResponse | null>;

    getDocumentTemporaryUrl(
        params: IObjectStorageProvider.GetDocumentTemporaryUrlParams,
    ): Promise<IObjectStorageProvider.GetDocumentTemporaryUrlResponse>;

    listDocuments(
        params?: IObjectStorageProvider.ListDocumentsParams,
    ): Promise<IObjectStorageProvider.ListDocumentsResponse>;

    deleteDocument(
        params: IObjectStorageProvider.DeleteDocumentParams,
    ): Promise<IObjectStorageProvider.DeleteDocumentResponse>;

    documentExists(
        params: IObjectStorageProvider.GetDocumentMetadataParams,
    ): Promise<boolean>;
}

export namespace IObjectStorageProvider {
    export type DocumentPrimitive = string | Uint8Array | Buffer;

    export type DocumentMetadata = Record<string, string>;

    export type DocumentDescriptor = {
        key: string;
        storageKey: string;
        bucket: string;
        url: string | null;
        etag?: string;
        contentType?: string;
        sizeBytes?: number;
        lastModified?: Date;
        metadata: DocumentMetadata;
    };

    export type PutDocumentParams = {
        key: string;
        body: DocumentPrimitive;
        contentType?: string;
        filename?: string;
        metadata?: DocumentMetadata;
        cacheControl?: string;
        contentDisposition?: string;
    };

    export type PutDocumentResponse = DocumentDescriptor;

    export type GetDocumentParams = {
        key: string;
    };

    export type GetDocumentResponse = DocumentDescriptor & {
        buffer: Buffer;
    };

    export type GetDocumentMetadataParams = {
        key: string;
    };

    export type GetDocumentMetadataResponse = DocumentDescriptor;

    export type GetDocumentTemporaryUrlParams = {
        key: string;
        bucket?: string;
        filename?: string;
        expiresInSeconds?: number;
        contentType?: string;
    };

    export type GetDocumentTemporaryUrlResponse = {
        key: string;
        storageKey: string;
        bucket: string;
        url: string;
        expiresAt: Date;
    };

    export type ListDocumentsParams = {
        prefix?: string;
        cursor?: string;
        limit?: number;
    };

    export type ListDocumentsResponse = {
        items: DocumentDescriptor[];
        nextCursor: string | null;
    };

    export type DeleteDocumentParams = {
        key: string;
    };

    export type DeleteDocumentResponse = {
        key: string;
        storageKey: string;
        deleted: true;
    };

    export type Contract = IObjectStorageProvider;
}
