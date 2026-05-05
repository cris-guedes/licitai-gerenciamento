import type { IEmbeddingProvider } from "@/server/modules/core-api/domain/data/IEmbeddingProvider";
import type { IVectorSearchProvider } from "@/server/modules/core-api/domain/data/IVectorSearchProvider";
import { createQdrantClient } from "./qdrant-client";

export class QdrantDocumentVectorSearchProvider implements IVectorSearchProvider {
    private readonly client = createQdrantClient(this.options);

    constructor(
        private readonly embeddingProvider: IEmbeddingProvider,
        private readonly options: QdrantDocumentVectorSearchProvider.Options = {},
    ) {}

    async search(input: IVectorSearchProvider.SearchInput): Promise<IVectorSearchProvider.SearchResult[]> {
        const embedding = await this.embeddingProvider.embed(input.query, true);
        const collectionName = this.options.collectionName ?? process.env.QDRANT_COLLECTION ?? "document_chunks";

        const response = await this.client.search(collectionName, {
            vector: Array.from(embedding),
            limit: input.limit,
            filter: {
                must: [
                    {
                        key: "documentId",
                        match: { value: input.documentId },
                    },
                ],
            },
            ...(input.minScore != null ? { score_threshold: input.minScore } : {}),
            with_payload: true,
        });

        return response.flatMap(point => {
            const payload = (point.payload ?? {}) as Record<string, unknown>;
            const content = typeof payload.content === "string" ? payload.content : null;

            if (!content) return [];

            const metadata = this.readMetadata(payload);

            return [{
                chunkId: this.readChunkId(point.id, payload),
                content,
                page: this.readPage(payload, metadata),
                heading: this.readHeading(payload, metadata),
                score: point.score,
                metadata,
            }];
        });
    }

    private readChunkId(pointId: string | number | bigint, payload: Record<string, unknown>) {
        if (typeof payload.chunkId === "string" && payload.chunkId.trim()) {
            return payload.chunkId;
        }

        return String(pointId);
    }

    private readPage(payload: Record<string, unknown>, metadata: Record<string, unknown> | undefined) {
        const directPage = payload.page;
        if (typeof directPage === "number" && Number.isFinite(directPage)) {
            return directPage;
        }

        const basePage = metadata?.base && typeof metadata.base === "object"
            ? (metadata.base as Record<string, unknown>).page
            : undefined;

        return typeof basePage === "number" && Number.isFinite(basePage) ? basePage : undefined;
    }

    private readHeading(payload: Record<string, unknown>, metadata: Record<string, unknown> | undefined) {
        if (typeof payload.heading === "string" && payload.heading.trim()) {
            return payload.heading;
        }

        if (typeof payload.header === "string" && payload.header.trim()) {
            return payload.header;
        }

        const baseSection = metadata?.base && typeof metadata.base === "object"
            ? (metadata.base as Record<string, unknown>).section
            : undefined;

        return typeof baseSection === "string" && baseSection.trim() ? baseSection : undefined;
    }

    private readMetadata(payload: Record<string, unknown>) {
        if (payload.metadata && typeof payload.metadata === "object") {
            return payload.metadata as Record<string, unknown>;
        }

        return undefined;
    }
}

export namespace QdrantDocumentVectorSearchProvider {
    export type Options = {
        url?: string;
        apiKey?: string;
        collectionName?: string;
    };
}
