import { ChunkedDocumentResultItem, DoclingClient } from "@/server/shared/lib/docling";


const DOCLING_BASE_URL = process.env.DOCLING_API_URL ?? "http://localhost:5001";

export class ChunkingProvider {
    private readonly client: DoclingClient;

    constructor() {
        this.client = new DoclingClient({ BASE: DOCLING_BASE_URL });
    }

    async chunkMarkdown({
        mdContent,
        chunkSize,
        chunkOverlap,
    }: ChunkingProvider.ChunkMarkdownParams): Promise<ChunkingProvider.ChunkMarkdownResponse> {
        const startTime = Date.now();

        console.log(`[ChunkingProvider] Iniciando chunking — chars: ${mdContent.length}`);

        const response = await this.client.chunk.chunkSourcesWithHybridChunkerV1ChunkHybridSourcePost({
            requestBody: {
                sources: [{
                    base64_string: Buffer.from(mdContent).toString("base64"),
                    filename: "document.md",
                    kind: "file",
                }],
                chunking_options: {
                    merge_peers: true,
                    use_markdown_tables: true,
                    max_tokens: 1024, // Aumenta o tamanho máximo dos chunks para blocos mais coesos
                },
            },
        });

        const processingTimeMs = Date.now() - startTime;
        const chunks = response.chunks ?? [];

        console.log(`[ChunkingProvider] Chunking concluído em ${processingTimeMs}ms — total chunks: ${chunks.length}`);

        return {
            chunks,
            processingTimeMs,
            chunkCount: chunks.length
        };
    }
}

export namespace ChunkingProvider {
    export type ChunkMarkdownParams = {
        mdContent: string;
        chunkSize?: number;
        chunkOverlap?: number;
    };

    export type ChunkMarkdownResponse = {
        chunks: ChunkedDocumentResultItem[];
        processingTimeMs: number;
        chunkCount: number;
    };

    /** Interface estrutural — qualquer provider que implemente chunkMarkdown é compatível */
    export type Contract = {
        chunkMarkdown(params: ChunkMarkdownParams): ChunkMarkdownResponse | Promise<ChunkMarkdownResponse>;
    };
}
