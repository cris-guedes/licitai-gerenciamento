export class HttpDownloadProvider {
    async download(url: string): Promise<{ buffer: Buffer; sizeBytes: number }> {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Falha ao baixar: HTTP ${res.status} — ${url}`);
        const buffer = Buffer.from(await res.arrayBuffer());
        return { buffer, sizeBytes: buffer.byteLength };
    }
}

export namespace HttpDownloadProvider {
    export type Contract = HttpDownloadProvider;
}
