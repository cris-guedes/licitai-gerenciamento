/* eslint-disable @typescript-eslint/no-namespace */
import {
    DeleteObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { IObjectStorageProvider } from "@/server/modules/core-api/domain/data/IObjectStorageProvider";

export class CloudflareR2ObjectStorageProvider implements IObjectStorageProvider.Contract {
    private readonly client: S3Client;
    private readonly bucket: string;
    private readonly endpoint: string;
    private readonly defaultPrefix: string;
    private readonly publicBaseUrl: string | null;
    private readonly signedUrlExpiresInSeconds: number;

    constructor(options: CloudflareR2ObjectStorageProvider.Options = {}) {
        const accountId = options.accountId ?? process.env.CLOUDFLARE_R2_ACCOUNT_ID;
        const accessKeyId = options.accessKeyId ?? process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
        const secretAccessKey = options.secretAccessKey ?? process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
        const bucket = options.bucket ?? process.env.CLOUDFLARE_R2_BUCKET;
        const endpoint = normalizeEndpoint(
            options.endpoint
            ?? process.env.CLOUDFLARE_R2_ENDPOINT
            ?? (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined),
        );

        if (!bucket) {
            throw new Error("CLOUDFLARE_R2_BUCKET não configurado.");
        }

        if (!accessKeyId || !secretAccessKey) {
            throw new Error("Credenciais do Cloudflare R2 não configuradas.");
        }

        if (!endpoint) {
            throw new Error("CLOUDFLARE_R2_ENDPOINT ou CLOUDFLARE_R2_ACCOUNT_ID não configurado.");
        }

        this.endpoint = endpoint;
        this.bucket = bucket;
        this.defaultPrefix = normalizePrefix(
            options.defaultPrefix ?? process.env.CLOUDFLARE_R2_DOCUMENTS_PREFIX,
        );
        this.publicBaseUrl = normalizePublicBaseUrl(
            options.publicBaseUrl ?? process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL,
        );
        this.signedUrlExpiresInSeconds = normalizeSignedUrlTtl(
            options.signedUrlExpiresInSeconds ?? process.env.CLOUDFLARE_R2_SIGNED_URL_EXPIRES_IN,
        );
        this.client = new S3Client({
            region: options.region ?? process.env.CLOUDFLARE_R2_REGION ?? "auto",
            endpoint,
            credentials: { accessKeyId, secretAccessKey },
        });
    }

    async putDocument(
        params: IObjectStorageProvider.PutDocumentParams,
    ): Promise<IObjectStorageProvider.PutDocumentResponse> {
        const storageKey = this.resolveStorageKey(params.key);
        const buffer = toBuffer(params.body);

        const response = await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: storageKey,
                Body: buffer,
                ContentType: params.contentType ?? guessContentType(params.filename),
                CacheControl: params.cacheControl,
                ContentDisposition: params.contentDisposition ?? buildContentDisposition(params.filename),
                Metadata: params.metadata,
            }),
        );

        return {
            key: normalizeLogicalKey(params.key),
            storageKey,
            bucket: this.bucket,
            url: this.buildPublicUrl(storageKey),
            etag: normalizeEtag(response.ETag),
            contentType: params.contentType ?? guessContentType(params.filename),
            sizeBytes: buffer.byteLength,
            metadata: params.metadata ?? {},
        };
    }

    async getDocument(
        params: IObjectStorageProvider.GetDocumentParams,
    ): Promise<IObjectStorageProvider.GetDocumentResponse | null> {
        const storageKey = this.resolveStorageKey(params.key);

        try {
            const response = await this.client.send(
                new GetObjectCommand({
                    Bucket: this.bucket,
                    Key: storageKey,
                }),
            );

            return {
                key: normalizeLogicalKey(params.key),
                storageKey,
                bucket: this.bucket,
                url: this.buildPublicUrl(storageKey),
                etag: normalizeEtag(response.ETag),
                contentType: response.ContentType,
                sizeBytes: response.ContentLength,
                lastModified: response.LastModified,
                metadata: response.Metadata ?? {},
                buffer: await bodyToBuffer(response.Body),
            };
        } catch (error) {
            if (isNotFoundError(error)) return null;
            throw error;
        }
    }

    async getDocumentMetadata(
        params: IObjectStorageProvider.GetDocumentMetadataParams,
    ): Promise<IObjectStorageProvider.GetDocumentMetadataResponse | null> {
        const storageKey = this.resolveStorageKey(params.key);

        try {
            const response = await this.client.send(
                new HeadObjectCommand({
                    Bucket: this.bucket,
                    Key: storageKey,
                }),
            );

            return {
                key: normalizeLogicalKey(params.key),
                storageKey,
                bucket: this.bucket,
                url: this.buildPublicUrl(storageKey),
                etag: normalizeEtag(response.ETag),
                contentType: response.ContentType,
                sizeBytes: response.ContentLength,
                lastModified: response.LastModified,
                metadata: response.Metadata ?? {},
            };
        } catch (error) {
            if (isNotFoundError(error)) return null;
            throw error;
        }
    }

    async getDocumentTemporaryUrl(
        params: IObjectStorageProvider.GetDocumentTemporaryUrlParams,
    ): Promise<IObjectStorageProvider.GetDocumentTemporaryUrlResponse> {
        const storageKey = this.resolveStorageKey(params.key);
        const bucket = this.resolveBucket(params.bucket);
        const expiresInSeconds = params.expiresInSeconds ?? this.signedUrlExpiresInSeconds;
        const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

        const url = await getSignedUrl(
            this.client,
            new GetObjectCommand({
                Bucket: bucket,
                Key: storageKey,
                ResponseContentType: params.contentType,
                ResponseContentDisposition: buildContentDisposition(params.filename),
            }),
            { expiresIn: expiresInSeconds },
        );

        return {
            key: normalizeLogicalKey(params.key),
            storageKey,
            bucket,
            url,
            expiresAt,
        };
    }

    async listDocuments(
        params: IObjectStorageProvider.ListDocumentsParams = {},
    ): Promise<IObjectStorageProvider.ListDocumentsResponse> {
        const prefix = this.resolvePrefix(params.prefix);
        const response = await this.client.send(
            new ListObjectsV2Command({
                Bucket: this.bucket,
                Prefix: prefix || undefined,
                ContinuationToken: params.cursor,
                MaxKeys: params.limit,
            }),
        );

        return {
            items: (response.Contents ?? []).map(item => {
                const storageKey = item.Key ?? "";
                return {
                    key: this.toLogicalKey(storageKey),
                    storageKey,
                    bucket: this.bucket,
                    url: this.buildPublicUrl(storageKey),
                    etag: normalizeEtag(item.ETag),
                    sizeBytes: item.Size,
                    lastModified: item.LastModified,
                    metadata: {},
                };
            }),
            nextCursor: response.NextContinuationToken ?? null,
        };
    }

    async deleteDocument(
        params: IObjectStorageProvider.DeleteDocumentParams,
    ): Promise<IObjectStorageProvider.DeleteDocumentResponse> {
        const storageKey = this.resolveStorageKey(params.key);

        await this.client.send(
            new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: storageKey,
            }),
        );

        return {
            key: normalizeLogicalKey(params.key),
            storageKey,
            deleted: true,
        };
    }

    async documentExists(
        params: IObjectStorageProvider.GetDocumentMetadataParams,
    ): Promise<boolean> {
        const metadata = await this.getDocumentMetadata(params);
        return metadata !== null;
    }

    private resolveStorageKey(key: string): string {
        const logicalKey = normalizeLogicalKey(key);
        if (!logicalKey) {
            throw new Error("Document key é obrigatório.");
        }

        return this.defaultPrefix ? `${this.defaultPrefix}/${logicalKey}` : logicalKey;
    }

    private resolveBucket(bucket?: string): string {
        return bucket?.trim() || this.bucket;
    }

    private resolvePrefix(prefix?: string): string {
        const normalizedPrefix = normalizePrefix(prefix);
        if (this.defaultPrefix && normalizedPrefix) {
            return `${this.defaultPrefix}/${normalizedPrefix}`;
        }

        return this.defaultPrefix || normalizedPrefix;
    }

    private toLogicalKey(storageKey: string): string {
        if (!this.defaultPrefix) return storageKey;
        if (storageKey === this.defaultPrefix) return "";
        if (storageKey.startsWith(`${this.defaultPrefix}/`)) {
            return storageKey.slice(this.defaultPrefix.length + 1);
        }

        return storageKey;
    }

    private buildPublicUrl(storageKey: string): string | null {
        if (this.publicBaseUrl) {
            return `${this.publicBaseUrl}/${encodeObjectKey(storageKey)}`;
        }

        return `${this.endpoint}/${this.bucket}/${encodeObjectKey(storageKey)}`;
    }
}

export namespace CloudflareR2ObjectStorageProvider {
    export type Options = {
        accountId?: string;
        accessKeyId?: string;
        secretAccessKey?: string;
        bucket?: string;
        endpoint?: string;
        region?: string;
        defaultPrefix?: string;
        publicBaseUrl?: string;
        signedUrlExpiresInSeconds?: number | string;
    };
}

function normalizeLogicalKey(key: string): string {
    return key.trim().replace(/^\/+/, "");
}

function normalizePrefix(prefix?: string): string {
    return (prefix ?? "").trim().replace(/^\/+|\/+$/g, "");
}

function normalizeEndpoint(endpoint?: string): string | undefined {
    if (!endpoint?.trim()) return undefined;
    return endpoint.trim().replace(/\/+$/g, "");
}

function normalizePublicBaseUrl(url?: string): string | null {
    if (!url?.trim()) return null;
    return url.trim().replace(/\/+$/g, "");
}

function normalizeSignedUrlTtl(input?: number | string): number {
    if (typeof input === "number" && Number.isFinite(input) && input > 0) return Math.floor(input);

    if (typeof input === "string") {
        const parsed = Number.parseInt(input.trim(), 10);
        if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }

    return 60 * 15;
}

function normalizeEtag(etag?: string): string | undefined {
    return etag?.replace(/"/g, "");
}

function buildContentDisposition(filename?: string): string | undefined {
    if (!filename?.trim()) return undefined;
    const sanitized = filename.replace(/"/g, "");
    return `inline; filename="${sanitized}"`;
}

function guessContentType(filename?: string): string | undefined {
    if (!filename) return undefined;
    if (filename.toLowerCase().endsWith(".pdf")) return "application/pdf";
    return undefined;
}

function toBuffer(body: IObjectStorageProvider.DocumentPrimitive): Buffer {
    if (Buffer.isBuffer(body)) return body;
    if (typeof body === "string") return Buffer.from(body);
    return Buffer.from(body);
}

async function bodyToBuffer(body: unknown): Promise<Buffer> {
    if (!body) return Buffer.alloc(0);
    if (Buffer.isBuffer(body)) return body;
    if (body instanceof Uint8Array) return Buffer.from(body);

    if (hasTransformToByteArray(body)) {
        return Buffer.from(await body.transformToByteArray());
    }

    if (hasArrayBuffer(body)) {
        return Buffer.from(await body.arrayBuffer());
    }

    if (isAsyncIterable(body)) {
        const chunks: Buffer[] = [];

        for await (const chunk of body) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }

        return Buffer.concat(chunks);
    }

    throw new Error("Não foi possível converter o body retornado pelo storage em Buffer.");
}

function isNotFoundError(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;

    const candidate = error as { name?: string; $metadata?: { httpStatusCode?: number } };
    return candidate.name === "NoSuchKey"
        || candidate.name === "NotFound"
        || candidate.$metadata?.httpStatusCode === 404;
}

function isAsyncIterable(value: unknown): value is AsyncIterable<Uint8Array | Buffer> {
    return !!value
        && typeof value === "object"
        && Symbol.asyncIterator in value
        && typeof (value as AsyncIterable<unknown>)[Symbol.asyncIterator] === "function";
}

function hasArrayBuffer(value: unknown): value is { arrayBuffer(): Promise<ArrayBuffer> } {
    return !!value
        && typeof value === "object"
        && "arrayBuffer" in value
        && typeof value.arrayBuffer === "function";
}

function hasTransformToByteArray(value: unknown): value is { transformToByteArray(): Promise<Uint8Array> } {
    return !!value
        && typeof value === "object"
        && "transformToByteArray" in value
        && typeof value.transformToByteArray === "function";
}

function encodeObjectKey(key: string): string {
    return key.split("/").map(encodeURIComponent).join("/");
}
