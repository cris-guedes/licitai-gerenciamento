import type { IVectorStore } from "@/server/modules/core-api/domain/data/IVectorStore";
import type { IEmbeddingProvider } from "@/server/modules/core-api/domain/data/IEmbeddingProvider";
import type { IAgent } from "@/server/modules/core-api/domain/data/IAgent";
import type { TableIngestionWorker } from "@/server/modules/core-api/workers/pdf-ingestion/TableIngestionWorker";
import type { IPromiseProvider } from "@/server/modules/core-api/domain/data/IPromiseProvider";
import type { IDocumentPrettifyProvider } from "@/server/modules/core-api/domain/data/IDocumentPrettifyProvider";
import type { ExtractEditalTracker } from "../utils/ExtractEditalTracker";
import type { ExtractEditalData } from "../ExtractEditalData";
import { performance } from "perf_hooks";

export type ExtractItemsPipelineInput = {
    pdfBuffer: Buffer;
    documentId: string;
    tracker: ExtractEditalTracker;
    config: ExtractEditalData.VectorStoreConfig;
    onBatchCompleted?: (event: ExtractItemsPipeline.BatchCompletedEvent) => void | Promise<void>;
};

type QueryPreparationMetrics = {
    totalTimeMs: number;
    queryCount: number;
    embeddingTokensUsed: number;
};

type SearchMetrics = {
    totalTimeMs: number;
    vectorSearchTimeMs: number;
    postProcessTimeMs: number;
    queryCount: number;
    hitsPerQuery: number;
    rawHits: number;
    uniqueHits: number;
    filteredHits: number;
    selectedHits: number;
    limit: number;
    minScore: number;
};

type BatchingMetrics = {
    totalTimeMs: number;
    batchCount: number;
    maxCharsPerBatch: number;
    totalPayloadChars: number;
    averageBatchChars: number;
    maxBatchChars: number;
    averagePayloadsPerBatch: number;
    maxPayloadsPerBatch: number;
};

type ExtractionMetrics = {
    totalTimeMs: number;
    cumulativeBatchTimeMs: number;
    batchCount: number;
    concurrency: number;
    payloadCount: number;
    payloadChars: number;
    extractedItemsCount: number;
    uniqueItemsCount: number;
    averageBatchTimeMs: number;
    slowestBatchTimeMs: number;
    fastestBatchTimeMs: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
};

export type ExtractItemsPipelineMetrics = {
    totalTimeMs: number;
    prepareQueries: QueryPreparationMetrics;
    search: SearchMetrics;
    batching: BatchingMetrics;
    extraction: ExtractionMetrics;
};

export type ExtractItemsPipelineResult = {
    itens: any[];
    tokensUsed: { prompt: number; completion: number; total: number };
    itemChunks: { payloads: ItemChunkPayload[]; count: number };
    ingestionResult: TableIngestionWorker.Result & { prettifiedRaw?: string };
    prettifyMetrics: { prompt: number; completion: number; total: number };
    searchQueries: string[];
    metrics: ExtractItemsPipelineMetrics;
};

type ItemChunkPayload = {
    chunkId: string;
    page: number;
    origin?: string;
    section?: string;
    content: string;
};

type BatchExecutionResult = {
    data: any[];
    metrics: { tokensUsed: { prompt: number; completion: number; total: number } };
    prettifyMetrics: { prompt: number; completion: number; total: number };
    batchTimeMs: number;
    batchPayloadCount: number;
    batchPayloadChars: number;
};

export class ExtractItemsPipeline {
    private readonly MAX_CHARS_PER_BATCH = 4_000;

    constructor(
        private readonly ingestionWorker: TableIngestionWorker,
        private readonly embeddingProvider: IEmbeddingProvider,
        private readonly vectorStore: IVectorStore.Contract,
        private readonly itemExtractor: IAgent<Record<string, any>[], any[]>,
        private readonly promiseProvider: IPromiseProvider,
        private readonly prettifyProvider: IDocumentPrettifyProvider,
    ) { }

    async execute(input: ExtractItemsPipelineInput): Promise<ExtractItemsPipelineResult> {
        const { pdfBuffer, documentId, tracker, config, onBatchCompleted } = input;
        const pipelineStartedAt = performance.now();

        const [ingestionResult, queries] = await Promise.all([
            this.runIngestion(pdfBuffer, documentId, tracker, config),
            this.prepareItemQueries(tracker),
        ]);

        const vectorSearchStartedAt = performance.now();
        const { hits, hitsPerQuery } = await this.searchItemChunks(documentId, queries.itemVectors, config);
        const vectorSearchTimeMs = performance.now() - vectorSearchStartedAt;

        const postProcessStartedAt = performance.now();
        const itemChunks = this.processItemChunks(hits, config.ITEM_SEARCH_LIMIT);
        const postProcessTimeMs = performance.now() - postProcessStartedAt;

        if (itemChunks.payloads.length === 0) {
            const pipelineTimeMs = performance.now() - pipelineStartedAt;
            return {
                itens: [],
                tokensUsed: { prompt: 0, completion: 0, total: 0 },
                itemChunks,
                ingestionResult: {
                    ...ingestionResult,
                    prettifiedRaw: "",
                },
                prettifyMetrics: { prompt: 0, completion: 0, total: 0 },
                searchQueries: queries.queries,
                metrics: {
                    totalTimeMs: pipelineTimeMs,
                    prepareQueries: {
                        totalTimeMs: queries.timeMs,
                        queryCount: queries.queryCount,
                        embeddingTokensUsed: queries.embeddingTokensUsed,
                    },
                    search: {
                        totalTimeMs: vectorSearchTimeMs + postProcessTimeMs,
                        vectorSearchTimeMs,
                        postProcessTimeMs,
                        queryCount: queries.queryCount,
                        hitsPerQuery,
                        rawHits: itemChunks.stats.rawHits,
                        uniqueHits: itemChunks.stats.uniqueHits,
                        filteredHits: itemChunks.stats.filteredHits,
                        selectedHits: 0,
                        limit: config.ITEM_SEARCH_LIMIT,
                        minScore: config.ITEM_SCORE_THRESHOLD,
                    },
                    batching: {
                        totalTimeMs: 0,
                        batchCount: 0,
                        maxCharsPerBatch: this.MAX_CHARS_PER_BATCH,
                        totalPayloadChars: 0,
                        averageBatchChars: 0,
                        maxBatchChars: 0,
                        averagePayloadsPerBatch: 0,
                        maxPayloadsPerBatch: 0,
                    },
                    extraction: {
                        totalTimeMs: 0,
                        cumulativeBatchTimeMs: 0,
                        batchCount: 0,
                        concurrency: config.ITEM_EXTRACTION_CONCURRENCY,
                        payloadCount: 0,
                        payloadChars: 0,
                        extractedItemsCount: 0,
                        uniqueItemsCount: 0,
                        averageBatchTimeMs: 0,
                        slowestBatchTimeMs: 0,
                        fastestBatchTimeMs: 0,
                        promptTokens: 0,
                        completionTokens: 0,
                        totalTokens: 0,
                    },
                },
            };
        }

        const extractionStep = tracker.extractItens();

        const batchingStartedAt = performance.now();
        const batches = this.splitIntoBatches(itemChunks.payloads, this.MAX_CHARS_PER_BATCH);
        this.assertNoDuplicateChunkIdsAcrossBatches(batches);
        const batchingTimeMs = performance.now() - batchingStartedAt;
        const batchSummary = this.summarizeBatches(batches);

        console.log(`[ExtractItemsPipeline] ${itemChunks.payloads.length} payloads semânticos → ${batches.length} lotes (concurrency=${config.ITEM_EXTRACTION_CONCURRENCY})`);

        const partialState = {
            completedBatches: 0,
            cumulativeItems: [] as any[],
        };

        const results = await this.promiseProvider.runAll(
            batches.map((batch, i) => async () => {
                extractionStep.relay(`Extraindo itens (lote ${i + 1}/${batches.length}): interpretando resultados semânticos...`, 72 + Math.round(((i + 1) / batches.length) * 12));

                const agentPayload = batch.map(({ chunkId: _chunkId, ...payload }) => payload);
                const batchStartedAt = performance.now();
                const res = await this.itemExtractor.extract(agentPayload);
                const batchTimeMs = performance.now() - batchStartedAt;

                partialState.completedBatches += 1;
                const batchItems = this.deduplicateExtractedItems(res.data);
                partialState.cumulativeItems = this.deduplicateExtractedItems([
                    ...partialState.cumulativeItems,
                    ...batchItems,
                ]);

                await onBatchCompleted?.({
                    batchIndex: i + 1,
                    totalBatches: batches.length,
                    completedBatches: partialState.completedBatches,
                    batchItems,
                    cumulativeItems: [...partialState.cumulativeItems],
                    batchTimeMs,
                    batchPayloadCount: batch.length,
                    batchPayloadChars: this.calculatePayloadChars(batch),
                });

                return {
                    ...res,
                    prettifyMetrics: { prompt: 0, completion: 0, total: 0 },
                    batchTimeMs,
                    batchPayloadCount: batch.length,
                    batchPayloadChars: this.calculatePayloadChars(batch),
                } satisfies BatchExecutionResult;
            }),
            config.ITEM_EXTRACTION_CONCURRENCY
        );

        const allItems: any[] = [];
        let totalPrompt = 0;
        let totalCompletion = 0;
        let pretPrompt = 0;
        let pretCompletion = 0;
        const batchDurations: number[] = [];

        for (const result of results) {
            allItems.push(...result.data);
            totalPrompt += result.metrics.tokensUsed.prompt;
            totalCompletion += result.metrics.tokensUsed.completion;
            pretPrompt += result.prettifyMetrics.prompt;
            pretCompletion += result.prettifyMetrics.completion;
            batchDurations.push(result.batchTimeMs);
        }

        const uniqueItems = this.deduplicateExtractedItems(allItems);
        const extractionTimeMs = extractionStep.done(uniqueItems.length);
        const pipelineTimeMs = performance.now() - pipelineStartedAt;

        return {
            itens: uniqueItems,
            tokensUsed: { prompt: totalPrompt, completion: totalCompletion, total: totalPrompt + totalCompletion },
            itemChunks,
            ingestionResult: {
                ...ingestionResult,
                prettifiedRaw: ingestionResult.raw,
            },
            prettifyMetrics: { prompt: pretPrompt, completion: pretCompletion, total: pretPrompt + pretCompletion },
            searchQueries: queries.queries,
            metrics: {
                totalTimeMs: pipelineTimeMs,
                prepareQueries: {
                    totalTimeMs: queries.timeMs,
                    queryCount: queries.queryCount,
                    embeddingTokensUsed: queries.embeddingTokensUsed,
                },
                search: {
                    totalTimeMs: vectorSearchTimeMs + postProcessTimeMs,
                    vectorSearchTimeMs,
                    postProcessTimeMs,
                    queryCount: queries.queryCount,
                    hitsPerQuery,
                    rawHits: itemChunks.stats.rawHits,
                    uniqueHits: itemChunks.stats.uniqueHits,
                    filteredHits: itemChunks.stats.filteredHits,
                    selectedHits: itemChunks.payloads.length,
                    limit: config.ITEM_SEARCH_LIMIT,
                    minScore: config.ITEM_SCORE_THRESHOLD,
                },
                batching: {
                    totalTimeMs: batchingTimeMs,
                    batchCount: batches.length,
                    maxCharsPerBatch: this.MAX_CHARS_PER_BATCH,
                    totalPayloadChars: batchSummary.totalPayloadChars,
                    averageBatchChars: batchSummary.averageBatchChars,
                    maxBatchChars: batchSummary.maxBatchChars,
                    averagePayloadsPerBatch: batchSummary.averagePayloadsPerBatch,
                    maxPayloadsPerBatch: batchSummary.maxPayloadsPerBatch,
                },
                extraction: {
                    totalTimeMs: extractionTimeMs,
                    cumulativeBatchTimeMs: batchDurations.reduce((sum, duration) => sum + duration, 0),
                    batchCount: batches.length,
                    concurrency: config.ITEM_EXTRACTION_CONCURRENCY,
                    payloadCount: itemChunks.payloads.length,
                    payloadChars: batchSummary.totalPayloadChars,
                    extractedItemsCount: allItems.length,
                    uniqueItemsCount: uniqueItems.length,
                    averageBatchTimeMs: this.average(batchDurations),
                    slowestBatchTimeMs: batchDurations.length > 0 ? Math.max(...batchDurations) : 0,
                    fastestBatchTimeMs: batchDurations.length > 0 ? Math.min(...batchDurations) : 0,
                    promptTokens: totalPrompt,
                    completionTokens: totalCompletion,
                    totalTokens: totalPrompt + totalCompletion,
                },
            },
        };
    }

    private async runIngestion(pdfBuffer: Buffer, documentId: string, tracker: ExtractEditalTracker, config: ExtractEditalData.VectorStoreConfig) {
        const progress = tracker.ingest("items");
        const result = await this.ingestionWorker.ingest(documentId, {
            pdfBuffer,
            embeddingConcurrency: config.EMBEDDING_CONCURRENCY,
            storeConcurrency: config.STORE_CONCURRENCY,
            onProgress: progress,
        });
        progress.done();
        return result;
    }

    private async prepareItemQueries(tracker: ExtractEditalTracker) {
        const progress = tracker.prepareQueries("items");
        const queries = this.itemExtractor.getSearchQueries();

        const { results, tokensUsed } = await this.embeddingProvider.embedMany(
            queries.map((q, i) => ({ id: `item-q-${i}`, embedInput: q }))
        );

        const timeMs = progress.done();

        return {
            queries,
            itemVectors: results.map(r => r.embedding),
            queryCount: queries.length,
            timeMs,
            embeddingTokensUsed: tokensUsed,
        };
    }

    private async searchItemChunks(
        documentId: string,
        vectors: Float32Array[],
        config: ExtractEditalData.VectorStoreConfig
    ): Promise<{ hits: IVectorStore.ScoredPoint[]; hitsPerQuery: number }> {
        if (vectors.length === 0) return { hits: [], hitsPerQuery: 0 };

        const filter = {
            must: [
                { key: "document_id", match: { value: documentId } },
                { key: "metadata.base.type", match: { value: "table_row" } },
            ],
        };

        const hitsPerQuery = Math.max(10, Math.ceil(config.ITEM_SEARCH_LIMIT / Math.max(vectors.length, 1)));
        const allHits = await this.vectorStore.searchBatch(config.COLLECTION_NAME, vectors, {
            filter,
            limit: hitsPerQuery,
            minScore: config.ITEM_SCORE_THRESHOLD,
        });

        return {
            hits: allHits.flat(),
            hitsPerQuery,
        };
    }

    private processItemChunks(hits: IVectorStore.ScoredPoint[], limit: number) {
        const uniqueById = this.deduplicateHits(hits);
        const clean = this.cleanItemHits(uniqueById);
        const ranked = this.rankItemHits(clean, limit);
        const sorted = this.sortItemsByPage(ranked);
        const payloads = this.mapToFinalPayloads(sorted);

        return {
            payloads,
            count: clean.length,
            stats: {
                rawHits: hits.length,
                uniqueHits: uniqueById.length,
                filteredHits: clean.length,
            },
        };
    }

    private deduplicateHits(hits: IVectorStore.ScoredPoint[]): IVectorStore.ScoredPoint[] {
        const seen = new Set<string>();
        return hits.filter(h => {
            const key = String(h.id);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    private deduplicateExtractedItems(items: any[]): any[] {
        const seen = new Set<string>();
        return items.filter(item => {
            const numero = this.unwrapExtractedValue(item.numero);
            const descricao = this.unwrapExtractedValue(item.descricao);
            const desc = String(descricao ?? "").toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 100);
            const key = `${numero}-${desc}`;

            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    private cleanItemHits(hits: IVectorStore.ScoredPoint[]): IVectorStore.ScoredPoint[] {
        return hits.filter(h => typeof h.payload.content === "string" && h.payload.content.trim().length > 10);
    }

    private rankItemHits(hits: IVectorStore.ScoredPoint[], limit: number): IVectorStore.ScoredPoint[] {
        const groups = new Map<string, { totalScore: number; chunks: IVectorStore.ScoredPoint[] }>();

        for (const hit of hits) {
            const origin = hit.payload.metadata?.base?.origin
                ?? hit.payload.metadata?.base?.section
                ?? hit.payload.origin
                ?? hit.payload.section
                ?? "Tabela";

            const group = groups.get(origin) ?? { totalScore: 0, chunks: [] };
            group.totalScore += hit.score;
            group.chunks.push(hit);
            groups.set(origin, group);
        }

        const rankedChunks: IVectorStore.ScoredPoint[] = [];
        const sortedOrigins = Array.from(groups.values()).sort((a, b) => b.totalScore - a.totalScore);

        for (const group of sortedOrigins) {
            rankedChunks.push(...group.chunks.sort((a, b) => b.score - a.score));
        }

        return rankedChunks.slice(0, limit);
    }

    private sortItemsByPage(hits: IVectorStore.ScoredPoint[]): IVectorStore.ScoredPoint[] {
        return [...hits].sort((a, b) => {
            const pageDiff = (a.payload.metadata?.base?.page ?? 0) - (b.payload.metadata?.base?.page ?? 0);
            if (pageDiff !== 0) return pageDiff;
            return (a.payload.metadata?.base?.chunk_index ?? 0) - (b.payload.metadata?.base?.chunk_index ?? 0);
        });
    }

    private mapToFinalPayloads(hits: IVectorStore.ScoredPoint[]): ItemChunkPayload[] {
        return hits.map(h => this.compactPayload({
            chunkId: String(h.id),
            page: h.payload.metadata?.base?.page ?? h.payload.page,
            origin: h.payload.metadata?.base?.origin ?? h.payload.origin,
            section: h.payload.metadata?.base?.section ?? h.payload.section,
            content: h.payload.content,
        }) as ItemChunkPayload);
    }

    private splitIntoBatches(payloads: ItemChunkPayload[], maxChars: number): ItemChunkPayload[][] {
        if (payloads.length === 0) return [];

        const batches: ItemChunkPayload[][] = [];
        let currentBatch: ItemChunkPayload[] = [];
        let currentChars = 2;

        for (const payload of payloads) {
            const serialized = JSON.stringify(this.toAgentPayload(payload));
            const nextChars = currentChars + serialized.length + (currentBatch.length > 0 ? 1 : 0);

            if (currentBatch.length > 0 && nextChars > maxChars) {
                batches.push(currentBatch);
                currentBatch = [payload];
                currentChars = 2 + serialized.length;
                continue;
            }

            currentBatch.push(payload);
            currentChars = nextChars;
        }

        if (currentBatch.length > 0) {
            batches.push(currentBatch);
        }

        return batches;
    }

    private assertNoDuplicateChunkIdsAcrossBatches(batches: ItemChunkPayload[][]) {
        const seen = new Map<string, number>();

        batches.forEach((batch, batchIndex) => {
            batch.forEach(payload => {
                const previousBatch = seen.get(payload.chunkId);
                if (previousBatch != null) {
                    throw new Error(`Chunk duplicado entre lotes paralelos: ${payload.chunkId} apareceu nos lotes ${previousBatch + 1} e ${batchIndex + 1}.`);
                }
                seen.set(payload.chunkId, batchIndex);
            });
        });
    }

    private toAgentPayload(payload: ItemChunkPayload) {
        const { chunkId: _chunkId, ...agentPayload } = payload;
        return agentPayload;
    }

    private compactPayload(payload: Record<string, any>) {
        return Object.fromEntries(
            Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== "")
        );
    }

    private summarizeBatches(batches: ItemChunkPayload[][]) {
        if (batches.length === 0) {
            return {
                totalPayloadChars: 0,
                averageBatchChars: 0,
                maxBatchChars: 0,
                averagePayloadsPerBatch: 0,
                maxPayloadsPerBatch: 0,
            };
        }

        const batchChars = batches.map(batch => this.calculatePayloadChars(batch));
        const batchPayloadCounts = batches.map(batch => batch.length);

        return {
            totalPayloadChars: batchChars.reduce((sum, value) => sum + value, 0),
            averageBatchChars: this.average(batchChars),
            maxBatchChars: Math.max(...batchChars),
            averagePayloadsPerBatch: this.average(batchPayloadCounts),
            maxPayloadsPerBatch: Math.max(...batchPayloadCounts),
        };
    }

    private calculatePayloadChars(payloads: ItemChunkPayload[]): number {
        return payloads.reduce((total, payload) => total + JSON.stringify(this.toAgentPayload(payload)).length, 0);
    }

    private average(values: number[]): number {
        if (values.length === 0) return 0;
        return values.reduce((sum, value) => sum + value, 0) / values.length;
    }

    private unwrapExtractedValue<T>(field: { value?: T | null } | T | null | undefined): T | null {
        if (field && typeof field === "object" && "value" in field) {
            return field.value ?? null;
        }

        return (field ?? null) as T | null;
    }
}

export namespace ExtractItemsPipeline {
    export type BatchCompletedEvent = {
        batchIndex: number;
        totalBatches: number;
        completedBatches: number;
        batchItems: any[];
        cumulativeItems: any[];
        batchTimeMs: number;
        batchPayloadCount: number;
        batchPayloadChars: number;
    };
}
