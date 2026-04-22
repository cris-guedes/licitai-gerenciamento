import type { IVectorStore } from "@/server/modules/core-api/domain/data/IVectorStore";
import type { TableIngestionWorker } from "@/server/modules/core-api/workers/pdf-ingestion/TableIngestionWorker";
import type { EditalItemExtractorAgent } from "@/server/shared/infra/providers/ia/agents/edital-item-extractor";
import type { IPromiseProvider } from "@/server/modules/core-api/domain/data/IPromiseProvider";
import type { IDocumentPrettifyProvider } from "@/server/modules/core-api/domain/data/IDocumentPrettifyProvider";
import type { ExtractEditalTracker } from "../utils/ExtractEditalTracker";
import type { ExtractEditalData } from "../ExtractEditalData";

export type ExtractItemsPipelineInput = {
    pdfBuffer: Buffer;
    documentId: string;
    tracker: ExtractEditalTracker;
    config: ExtractEditalData.VectorStoreConfig;
};

export type ExtractItemsPipelineResult = {
    itens: any[];
    tokensUsed: { prompt: number; completion: number; total: number };
    timeMs: number;
    itemChunks: { payloads: any[]; count: number };
    ingestionResult: TableIngestionWorker.Result & { prettifiedRaw?: string };
    prettifyMetrics: { prompt: number; completion: number; total: number };
};

export class ExtractItemsPipeline {
    private readonly MAX_CHARS_PER_BATCH = 4_000;

    constructor(
        private readonly ingestionWorker: TableIngestionWorker,
        private readonly vectorStore: IVectorStore.Contract,
        private readonly itemExtractor: EditalItemExtractorAgent,
        private readonly promiseProvider: IPromiseProvider,
        private readonly prettifyProvider: IDocumentPrettifyProvider,
    ) { }

    async execute(input: ExtractItemsPipelineInput): Promise<ExtractItemsPipelineResult> {
        const { pdfBuffer, documentId, tracker, config } = input;

        // 1. Ingestão específica para Tabelas
        const ingestionResult = await this.runIngestion(pdfBuffer, documentId, tracker, config);

        // 2. Busca de Chunks de Itens (Scroll em todas as linhas de tabela)
        const hits = await this.fetchItemChunks(documentId, config);
        const itemChunks = this.processItemChunks(hits);

        if (itemChunks.payloads.length === 0) {
            return {
                itens: [],
                tokensUsed: { prompt: 0, completion: 0, total: 0 },
                timeMs: 0,
                itemChunks,
                ingestionResult: {
                    ...ingestionResult,
                    prettifiedRaw: "",
                },
                prettifyMetrics: { prompt: 0, completion: 0, total: 0 },
            };
        }

        // 3. Extração de Itens com Batching e Concorrência (STEP PRETTIFY PULADO/COMENTADO)
        const extractionStep = tracker.extractItens();
        const fullText = itemChunks.payloads.map(p => p.content).join("\n\n");
        const batches = this.splitIntoBatches(fullText, this.MAX_CHARS_PER_BATCH);

        console.log(`[ExtractItemsPipeline] ${fullText.length} chars → ${batches.length} batches (concurrency=${config.ITEM_EXTRACTION_CONCURRENCY})`);

        const results = await this.promiseProvider.runAll(
            batches.map((batch, i) => async () => {
                // Extração direta do batch original
                const res = await this.itemExtractor.extract(batch);

                extractionStep.relay(`Extraindo itens (lote ${i + 1}/${batches.length}): IA processando...`, 72 + Math.round(((i + 1) / batches.length) * 12));

                return { ...res, prettifyMetrics: { prompt: 0, completion: 0, total: 0 } };
            }),
            config.ITEM_EXTRACTION_CONCURRENCY
        );

        // 4. Consolidar e Deduplicar Itens Finais
        const allItems: any[] = [];
        let totalPrompt = 0, totalCompletion = 0;
        let pretPrompt = 0;
        let pretCompletion = 0;

        for (const r of results) {
            allItems.push(...r.data);
            totalPrompt += r.metrics.tokensUsed.prompt;
            totalCompletion += r.metrics.tokensUsed.completion;
            pretPrompt += r.prettifyMetrics.prompt;
            pretCompletion += r.prettifyMetrics.completion;
        }

        // Deduplicação lógica de itens extraídos (opcional mas recomendado)
        const uniqueItems = this.deduplicateExtractedItems(allItems);

        const timeMs = extractionStep.done(uniqueItems.length);

        return {
            itens: uniqueItems,
            tokensUsed: { prompt: totalPrompt, completion: totalCompletion, total: totalPrompt + totalCompletion },
            timeMs,
            itemChunks,
            ingestionResult: {
                ...ingestionResult,
                prettifiedRaw: ingestionResult.raw,
            },
            prettifyMetrics: { prompt: pretPrompt, completion: pretCompletion, total: pretPrompt + pretCompletion },
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

    private async fetchItemChunks(documentId: string, config: ExtractEditalData.VectorStoreConfig): Promise<IVectorStore.ScoredPoint[]> {
        const filter = {
            must: [
                { key: "document_id", match: { value: documentId } },
                { key: "metadata.base.type", match: { value: "table_row" } },
            ],
        };

        const allPoints: IVectorStore.ScoredPoint[] = [];
        let offset: string | number | undefined = undefined;

        do {
            const { points, nextOffset } = await this.vectorStore.scroll(config.COLLECTION_NAME, {
                filter,
                limit: config.ITEM_SCROLL_BATCH_SIZE,
                offset
            });
            allPoints.push(...points.map(p => ({ id: p.id, score: config.ITEM_SCROLL_SCORE, payload: p.payload })));
            offset = nextOffset ?? undefined;
        } while (offset != null);

        return allPoints;
    }

    private processItemChunks(hits: IVectorStore.ScoredPoint[]) {
        const unique = this.deduplicateByContent(hits);
        const clean = this.cleanItemHits(unique);
        const sorted = this.sortItemsByPage(clean);
        const payloads = this.mapToFinalPayloads(sorted);

        return {
            payloads,
            count: unique.length,
        };
    }

    private deduplicateByContent(hits: IVectorStore.ScoredPoint[]): IVectorStore.ScoredPoint[] {
        const seen = new Set<string>();
        return hits.filter(h => {
            const content = h.payload.content?.trim();
            if (!content) return false;

            // Normalização agressiva para detectar linhas idênticas em tabelas repetidas
            const normalized = content
                .toLowerCase()
                .replace(/[^a-z0-9]/g, ""); // Remove tudo que não é alfanumérico

            if (seen.has(normalized)) return false;
            seen.add(normalized);
            return true;
        });
    }

    private deduplicateExtractedItems(items: any[]): any[] {
        const seen = new Set<string>();
        return items.filter(item => {
            // Chave única baseada em número do item + descrição (normalizada)
            const desc = (item.descricao || "").toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 100);
            const key = `${item.numero}-${desc}`;

            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    private cleanItemHits(hits: IVectorStore.ScoredPoint[]): IVectorStore.ScoredPoint[] {
        return hits.filter(h => typeof h.payload.content === "string" && h.payload.content.trim().length > 10);
    }

    private sortItemsByPage(hits: IVectorStore.ScoredPoint[]): IVectorStore.ScoredPoint[] {
        return [...hits].sort((a, b) => {
            const pageDiff = (a.payload.metadata?.base?.page ?? 0) - (b.payload.metadata?.base?.page ?? 0);
            if (pageDiff !== 0) return pageDiff;
            return (a.payload.metadata?.base?.chunk_index ?? 0) - (b.payload.metadata?.base?.chunk_index ?? 0);
        });
    }

    private mapToFinalPayloads(hits: IVectorStore.ScoredPoint[]) {
        return hits.map(h => ({
            page: h.payload.metadata?.base?.page ?? h.payload.page,
            origin: h.payload.metadata?.base?.origin ?? h.payload.origin,
            section: h.payload.metadata?.base?.section ?? h.payload.section,
            content: h.payload.content,
            raw: h.payload.raw ?? h.payload.content,
            score: h.score,
        }));
    }

    private splitIntoBatches(text: string, maxChars: number): string[] {
        if (text.length <= maxChars) return [text];

        const batches: string[] = [];
        const sections = text.split(/\n{2,}/);
        let current = "";

        for (const section of sections) {
            if (current.length + section.length + 2 > maxChars && current) {
                batches.push(current.trim());
                current = section;
            } else {
                current = current ? `${current}\n\n${section}` : section;
            }
        }
        if (current.trim()) batches.push(current.trim());

        return batches.filter(b => b.trim());
    }
}
