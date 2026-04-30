import type { IVectorStore } from "@/server/modules/core-api/domain/data/IVectorStore";
import type { IEmbeddingProvider } from "@/server/modules/core-api/domain/data/IEmbeddingProvider";
import type { IAgent } from "@/server/modules/core-api/domain/data/IAgent";
import type { PdfIngestionWorker } from "@/server/modules/core-api/workers/pdf-ingestion/PdfIngestionWorker";
import type { IDocumentPrettifyProvider } from "@/server/modules/core-api/domain/data/IDocumentPrettifyProvider";
import type { ExtractEditalTracker } from "../utils/ExtractEditalTracker";
import type { ExtractEditalData } from "../ExtractEditalData";
import { performance } from "perf_hooks";

export type ExtractInfoPipelineInput = {
    pdfBuffer: Buffer;
    documentId: string;
    tracker: ExtractEditalTracker;
    config: ExtractEditalData.VectorStoreConfig;
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
    selectedHits: number;
    limit: number;
    minScore: number;
};

type ExtractionMetrics = {
    totalTimeMs: number;
    agentCallTimeMs: number;
    payloadCount: number;
    payloadChars: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
};

export type ExtractInfoPipelineMetrics = {
    totalTimeMs: number;
    prepareQueries: QueryPreparationMetrics;
    search: SearchMetrics;
    extraction: ExtractionMetrics;
};

type InfoChunkPayload = {
    page: number;
    origin: string;
    content: string;
};

export type ExtractInfoPipelineResult = {
    extraction: any;
    tokensUsed: { prompt: number; completion: number; total: number };
    infoChunks: { payloads: InfoChunkPayload[]; count: number };
    ingestionResult: PdfIngestionWorker.Result & { prettifiedRaw?: string };
    prettifyMetrics: { prompt: number; completion: number; total: number };
    searchQueries: string[];
    metrics: ExtractInfoPipelineMetrics;
};

export class ExtractInfoPipeline {
    constructor(
        private readonly ingestionWorker: PdfIngestionWorker,
        private readonly embeddingProvider: IEmbeddingProvider,
        private readonly vectorStore: IVectorStore.Contract,
        private readonly fieldExtractor: IAgent<Record<string, any>[], Record<string, any>>,
        private readonly prettifyProvider: IDocumentPrettifyProvider,
    ) { }

    async execute(input: ExtractInfoPipelineInput): Promise<ExtractInfoPipelineResult> {
        const { pdfBuffer, documentId, tracker, config } = input;
        const pipelineStartedAt = performance.now();

        const [ingestionResult, queries] = await Promise.all([
            this.runIngestion(pdfBuffer, documentId, tracker, config),
            this.prepareFieldQueries(tracker),
        ]);

        const vectorSearchStartedAt = performance.now();
        const { hits, hitsPerQuery } = await this.searchTextChunks(documentId, queries.fieldVectors, config);
        const vectorSearchTimeMs = performance.now() - vectorSearchStartedAt;

        const postProcessStartedAt = performance.now();
        const infoChunks = this.processTextChunks(hits, config.FIELD_SEARCH_LIMIT);
        const postProcessTimeMs = performance.now() - postProcessStartedAt;

        const extractionStep = tracker.extractInfo();
        extractionStep.relay("Interpretando contexto com IA...", 70);

        const payloadChars = this.calculatePayloadChars(infoChunks.payloads);
        const agentCallStartedAt = performance.now();
        const { data: extraction, metrics } = await this.fieldExtractor.extract(infoChunks.payloads);
        const agentCallTimeMs = performance.now() - agentCallStartedAt;

        const extractionTimeMs = extractionStep.done();
        const pipelineTimeMs = performance.now() - pipelineStartedAt;

        return {
            extraction,
            tokensUsed: metrics.tokensUsed,
            infoChunks,
            ingestionResult: {
                ...ingestionResult,
                prettifiedRaw: ingestionResult.raw,
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
                    rawHits: infoChunks.stats.rawHits,
                    uniqueHits: infoChunks.stats.uniqueHits,
                    selectedHits: infoChunks.payloads.length,
                    limit: config.FIELD_SEARCH_LIMIT,
                    minScore: config.FIELD_SCORE_THRESHOLD,
                },
                extraction: {
                    totalTimeMs: extractionTimeMs,
                    agentCallTimeMs,
                    payloadCount: infoChunks.payloads.length,
                    payloadChars,
                    promptTokens: metrics.tokensUsed.prompt,
                    completionTokens: metrics.tokensUsed.completion,
                    totalTokens: metrics.tokensUsed.total,
                },
            },
        };
    }

    private async runIngestion(pdfBuffer: Buffer, documentId: string, tracker: ExtractEditalTracker, config: ExtractEditalData.VectorStoreConfig) {
        const progress = tracker.ingest("info");
        const result = await this.ingestionWorker.ingest(documentId, {
            pdfBuffer,
            embeddingConcurrency: config.EMBEDDING_CONCURRENCY,
            storeConcurrency: config.STORE_CONCURRENCY,
            onProgress: progress,
        });
        progress.done();
        return result;
    }

    private async prepareFieldQueries(tracker: ExtractEditalTracker) {
        const progress = tracker.prepareQueries("info");
        const queries = this.fieldExtractor.getSearchQueries();

        const { results, tokensUsed } = await this.embeddingProvider.embedMany(
            queries.map((q, i) => ({ id: `q-${i}`, embedInput: q }))
        );

        const timeMs = progress.done();
        return {
            queries,
            fieldVectors: results.map(r => r.embedding),
            queryCount: queries.length,
            timeMs,
            embeddingTokensUsed: tokensUsed,
        };
    }

    private async searchTextChunks(
        documentId: string,
        vectors: Float32Array[],
        config: ExtractEditalData.VectorStoreConfig
    ): Promise<{ hits: IVectorStore.ScoredPoint[]; hitsPerQuery: number }> {
        const filter = {
            must: [
                { key: "document_id", match: { value: documentId } },
                { key: "metadata.base.type", match: { value: "text" } },
            ],
        };

        const hitsPerQuery = 5;
        const allHits = await this.vectorStore.searchBatch(config.COLLECTION_NAME, vectors, {
            filter,
            limit: hitsPerQuery,
            minScore: config.FIELD_SCORE_THRESHOLD,
        });

        return {
            hits: allHits.flat(),
            hitsPerQuery,
        };
    }

    private processTextChunks(hits: IVectorStore.ScoredPoint[], limit: number) {
        const unique = this.deduplicateHits(hits);
        const groups = new Map<string, { totalScore: number; chunks: IVectorStore.ScoredPoint[] }>();

        for (const hit of unique) {
            const origin = hit.payload.metadata?.base?.section ?? hit.payload.section ?? "Geral";
            const group = groups.get(origin) ?? { totalScore: 0, chunks: [] };

            group.totalScore += hit.score;
            group.chunks.push(hit);
            groups.set(origin, group);
        }

        const sortedOrigins = Array.from(groups.values()).sort((a, b) => b.totalScore - a.totalScore);

        const rankedChunks: IVectorStore.ScoredPoint[] = [];
        for (const group of sortedOrigins) {
            rankedChunks.push(...group.chunks.sort((a, b) => b.score - a.score));
        }

        const selected = rankedChunks.slice(0, limit);
        const finalHits = this.sortByPage(selected);

        return {
            payloads: this.mapToFinalPayloads(finalHits),
            count: unique.length,
            stats: {
                rawHits: hits.length,
                uniqueHits: unique.length,
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

    private sortByPage(hits: IVectorStore.ScoredPoint[]): IVectorStore.ScoredPoint[] {
        return [...hits].sort((a, b) => {
            const pageDiff = (a.payload.metadata?.base?.page ?? 0) - (b.payload.metadata?.base?.page ?? 0);
            if (pageDiff !== 0) return pageDiff;
            return (a.payload.metadata?.base?.chunk_index ?? 0) - (b.payload.metadata?.base?.chunk_index ?? 0);
        });
    }

    private mapToFinalPayloads(hits: IVectorStore.ScoredPoint[]): InfoChunkPayload[] {
        return hits.map(h => ({
            page: h.payload.metadata?.base?.page ?? h.payload.page,
            origin: h.payload.metadata?.base?.section ?? h.payload.section ?? "Geral",
            content: h.payload.content,
        }));
    }

    private calculatePayloadChars(payloads: InfoChunkPayload[]): number {
        return payloads.reduce((total, payload) => total + JSON.stringify(payload).length, 0);
    }
}
