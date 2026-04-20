import { QdrantClient } from "@qdrant/js-client-rest";
import type { IVectorStore } from "@/server/modules/core-api/domain/data/IVectorStore";

export class QdrantVectorStore implements IVectorStore.Contract {
    private readonly client: QdrantClient;

    constructor(options: { url?: string; apiKey?: string } = {}) {
        const qdrantUrl = options.url ?? process.env.QDRANT_URL ?? "http://localhost:6333";
        const isHttps = qdrantUrl.startsWith("https");
        const host = qdrantUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "").split(":")[0];
        const port = isHttps ? 443 : 6333;

        this.client = new QdrantClient({
            host,
            port,
            https: isHttps,
            apiKey: options.apiKey ?? process.env.QDRANT_API_KEY,
            checkCompatibility: false,
        });
    }

    async ensureCollection(name: string, config: { vectorSize: number; payloadIndexFields?: string[] }): Promise<void> {
        try {
            const { collections } = await this.client.getCollections();

            if (!collections.some(c => c.name === name)) {
                await this.client.createCollection(name, {
                    vectors: { size: config.vectorSize, distance: "Cosine" },
                });
                console.log(`[QdrantVectorStore] Coleção criada: ${name} (${config.vectorSize} dims)`);
            }

            if (config.payloadIndexFields?.length) {
                await Promise.all(
                    config.payloadIndexFields.map(field =>
                        this.client.createPayloadIndex(name, { field_name: field, field_schema: "keyword" })
                    )
                ).catch(() => { /* índices já existem — ignorado silenciosamente */ });
            }
        } catch (err: any) {
            console.error(`[QdrantVectorStore] Erro ao garantir collection ${name}:`, err.message);
            throw err;
        }
    }

    async upsert(name: string, points: IVectorStore.Point[], batchSize = 200): Promise<void> {
        if (points.length === 0) return;

        const mapped = points.map(pt => ({
            id: pt.id as string | number,
            vector: Array.from(pt.vector),
            payload: pt.payload ?? {},
        }));

        for (let i = 0; i < mapped.length; i += batchSize) {
            await this.client.upsert(name, {
                wait: true,
                points: mapped.slice(i, i + batchSize),
            });
        }

        console.log(`[QdrantVectorStore] '${name}': upsert de ${points.length} pontos em lotes de ${batchSize}.`);
    }

    async search(
        name: string,
        vector: number[] | Float32Array,
        options?: IVectorStore.SearchOptions,
    ): Promise<IVectorStore.ScoredPoint[]> {
        const response = await this.client.search(name, {
            vector: Array.from(vector),
            limit: options?.limit ?? 5,
            filter: options?.filter,
            score_threshold: options?.minScore,
            with_payload: true,
        });

        return response.map(pt => ({ id: pt.id, score: pt.score, payload: pt.payload ?? {} }));
    }

    async searchBatch(
        name: string,
        vectors: (number[] | Float32Array)[],
        options?: IVectorStore.SearchOptions,
    ): Promise<IVectorStore.ScoredPoint[][]> {
        if (vectors.length === 0) return [];

        const responses = await this.client.searchBatch(name, {
            searches: vectors.map(v => ({
                vector: Array.from(v),
                limit: options?.limit ?? 5,
                filter: options?.filter,
                score_threshold: options?.minScore,
                with_payload: true,
            })),
        });

        return responses.map(batch => batch.map(pt => ({ id: pt.id, score: pt.score, payload: pt.payload ?? {} })));
    }

    async scroll(
        name: string,
        options?: IVectorStore.ScrollOptions,
    ): Promise<{ points: IVectorStore.ScrollPoint[]; nextOffset: string | number | null }> {
        const response = await this.client.scroll(name, {
            limit: options?.limit ?? 1000,
            filter: options?.filter as any,
            offset: options?.offset as any,
            with_payload: true,
            with_vector: false,
        });

        return {
            points: response.points.map(pt => ({ id: pt.id, payload: (pt.payload ?? {}) as Record<string, any> })),
            nextOffset: (response.next_page_offset ?? null) as string | number | null,
        };
    }

    async deleteCollection(name: string): Promise<void> {
        await this.client.deleteCollection(name);
    }
}
