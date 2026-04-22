import type { IVectorStore } from "@/server/modules/core-api/domain/data/IVectorStore";
import type { IEmbeddingProvider } from "@/server/modules/core-api/domain/data/IEmbeddingProvider";
import type { PdfIngestionWorker } from "@/server/modules/core-api/workers/pdf-ingestion/PdfIngestionWorker";
import type { EditalFieldExtractorAgent } from "@/server/shared/infra/providers/ia/agents/edital-field-extractor";
import type { IDocumentPrettifyProvider } from "@/server/modules/core-api/domain/data/IDocumentPrettifyProvider";
import type { ExtractEditalTracker } from "../utils/ExtractEditalTracker";
import type { ExtractEditalData } from "../ExtractEditalData";

export type ExtractInfoPipelineInput = {
    pdfBuffer: Buffer;
    documentId: string;
    tracker: ExtractEditalTracker;
    config: ExtractEditalData.VectorStoreConfig;
};

export type ExtractInfoPipelineResult = {
    extraction: any;
    tokensUsed: { prompt: number; completion: number; total: number };
    timeMs: number;
    searchCount: number;
    infoChunks: { payloads: any[]; count: number };
    ingestionResult: PdfIngestionWorker.Result & { prettifiedRaw?: string };
    prettifyMetrics: { prompt: number; completion: number; total: number };
};

export class ExtractInfoPipeline {
    constructor(
        private readonly ingestionWorker: PdfIngestionWorker,
        private readonly embeddingProvider: IEmbeddingProvider,
        private readonly vectorStore: IVectorStore.Contract,
        private readonly fieldExtractor: EditalFieldExtractorAgent,
        private readonly prettifyProvider: IDocumentPrettifyProvider,
    ) { }

    async execute(input: ExtractInfoPipelineInput): Promise<ExtractInfoPipelineResult> {
        const { pdfBuffer, documentId, tracker, config } = input;

        // 1. Ingestão e Preparação de Queries em paralelo
        const [ingestionResult, queries] = await Promise.all([
            this.runIngestion(pdfBuffer, documentId, tracker, config),
            this.prepareFieldQueries(tracker),
        ]);

        // 2. Busca e Processamento de Chunks
        const hits = await this.searchTextChunks(documentId, queries.fieldVectors, config);
        const infoChunks = this.processTextChunks(hits, config.FIELD_SEARCH_LIMIT);

        // 3. Extração de Campos (STEP PRETTIFY PULADO/COMENTADO)
        const extractionStep = tracker.extractInfo();

        // 4. Extração de Campos usando os chunks estruturados (sem prettify)
        extractionStep.relay("Interpretando contexto com IA...", 70);

        // Passamos os payloads estruturados (limpos) diretamente para a IA
        const { data: extraction, metrics } = await this.fieldExtractor.extract(infoChunks.payloads);

        const timeMs = extractionStep.done();

        return {
            extraction,
            tokensUsed: metrics.tokensUsed,
            timeMs,
            searchCount: infoChunks.count,
            infoChunks,
            ingestionResult: {
                ...ingestionResult,
                prettifiedRaw: ingestionResult.raw,
            },
            prettifyMetrics: { prompt: 0, completion: 0, total: 0 },
        };
    }

    private async runIngestion(pdfBuffer: Buffer, documentId: string, tracker: ExtractEditalTracker, config: ExtractEditalData.VectorStoreConfig) {
        const progress = tracker.ingest();
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
        const progress = tracker.prepareQueries();
        const queries = this.fieldExtractor.getSearchQueries();

        // Gerar embeddings para as queries de busca
        const { results } = await this.embeddingProvider.embedMany(
            queries.map((q, i) => ({ id: `q-${i}`, embedInput: q }))
        );

        progress.done();
        return { fieldVectors: results.map(r => r.embedding) };
    }

    private async searchTextChunks(documentId: string, vectors: Float32Array[], config: ExtractEditalData.VectorStoreConfig): Promise<IVectorStore.ScoredPoint[]> {
        const filter = {
            must: [
                { key: "document_id", match: { value: documentId } },
                { key: "metadata.base.type", match: { value: "text" } },
            ],
        };

        // 2. Busca Batch com limite por query
        const hitsPerQuery = 5;
        const allHits = await this.vectorStore.searchBatch(config.COLLECTION_NAME, vectors, {
            filter,
            limit: hitsPerQuery,
            minScore: config.FIELD_SCORE_THRESHOLD,
        });

        return allHits.flat();
    }

    private processTextChunks(hits: IVectorStore.ScoredPoint[], limit: number) {
        const unique = this.deduplicateHits(hits);

        // 1. Agrupar por Origin e calcular relevância da seção
        const groups = new Map<string, { totalScore: number; chunks: IVectorStore.ScoredPoint[] }>();

        for (const hit of unique) {
            const origin = hit.payload.metadata?.base?.section ?? hit.payload.section ?? "Geral";
            const group = groups.get(origin) ?? { totalScore: 0, chunks: [] };

            group.totalScore += hit.score;
            group.chunks.push(hit);
            groups.set(origin, group);
        }

        // 2. Ordenar Origins por score acumulado e chunks internos por score individual
        const sortedOrigins = Array.from(groups.values()).sort((a, b) => b.totalScore - a.totalScore);

        const rankedChunks: IVectorStore.ScoredPoint[] = [];
        for (const group of sortedOrigins) {
            // Ordena chunks dentro da origin por score descendente
            const sortedInGroup = group.chunks.sort((a, b) => b.score - a.score);
            rankedChunks.push(...sortedInGroup);
        }

        // 3. Corte no limite da config
        const selected = rankedChunks.slice(0, limit);

        // 4. Ordenação final por página para manter coerência no prompt
        const finalHits = this.sortByPage(selected);
        const payloads = this.mapToFinalPayloads(finalHits);

        return {
            payloads,
            count: unique.length,
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

    private mapToFinalPayloads(hits: IVectorStore.ScoredPoint[]) {
        return hits.map(h => ({
            page: h.payload.metadata?.base?.page ?? h.payload.page,
            origin: h.payload.metadata?.base?.section ?? h.payload.section ?? "Geral",
            content: h.payload.content,
        }));
    }
}
