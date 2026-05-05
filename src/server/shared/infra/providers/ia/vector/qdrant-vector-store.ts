import { QdrantClient } from "@qdrant/js-client-rest";
import type { IVectorStore } from "@/server/modules/core-api/domain/data/IVectorStore";
import { createQdrantClient } from "./qdrant-client";

export class QdrantVectorStore implements IVectorStore.Contract {
    private readonly client: QdrantClient;

    constructor(options: { url?: string; apiKey?: string } = {}) {
        this.client = createQdrantClient(options);
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
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(`[QdrantVectorStore] Erro ao garantir collection ${name}:`, message);
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
            filter: options?.filter as unknown as Record<string, unknown> | undefined,
            offset: options?.offset as unknown as string | number | undefined,
            with_payload: true,
            with_vector: false,
        });

        return {
            points: response.points.map(pt => ({ id: pt.id, payload: (pt.payload ?? {}) as Record<string, unknown> })),
            nextOffset: (response.next_page_offset ?? null) as string | number | null,
        };
    }

    async deleteByFilter(name: string, filter: IVectorStore.Filter): Promise<void> {
        try {
            await this.client.delete(name, {
                wait: true,
                filter,
            });
        } catch (err: unknown) {
            if (isCollectionNotFoundError(err)) {
                console.warn(`[QdrantVectorStore] Coleção '${name}' ainda não existe. deleteByFilter ignorado.`);
                return;
            }

            throw err;
        }
    }

    async deleteCollection(name: string): Promise<void> {
        await this.client.deleteCollection(name);
    }
}

function isCollectionNotFoundError(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;

    const candidate = error as {
        status?: number;
        data?: { status?: { error?: string } };
    };

    if (candidate.status === 404) return true;

    const message = candidate.data?.status?.error;
    return typeof message === "string" && message.toLowerCase().includes("not found");
}
