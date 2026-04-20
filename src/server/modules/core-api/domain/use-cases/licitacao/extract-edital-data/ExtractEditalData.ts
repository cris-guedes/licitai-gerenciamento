import type { ProcessPdfResponse } from "@/server/shared/lib/document-handler/DocumentHandlerClient";
import type { IEmbeddingProvider } from "@/server/modules/core-api/domain/data/IEmbeddingProvider";
import type { IVectorStore } from "@/server/modules/core-api/domain/data/IVectorStore";
import type { IndexEntry } from "@/server/shared/infra/providers/pdf/utils/normalize-entries";
import { DocumentHandlerFileParsingProvider } from "@/server/shared/infra/providers/pdf/document-handler-file-parsing-provider";
import { EditalFieldExtractorAgent } from "@/server/shared/infra/providers/ia/agents/edital-field-extractor";
import { EditalItemExtractorAgent } from "@/server/shared/infra/providers/ia/agents/edital-item-extractor";
import { MetricsProvider } from "@/server/shared/infra/providers/metrics/metrics-provider";
import { ExtractionSessionProvider } from "@/server/shared/infra/providers/session/extraction-session-provider";
import { ExtractEditalDataControllerSchemas } from "./ExtractEditalDataControllerSchemas";
import { EditalExtractionMapper } from "./dtos/EditalExtractionMapper";
import { ExtractEditalTracker } from "./utils/ExtractEditalTracker";


type PipelineCtx = {
    input: ExtractEditalData.Input;
    sessionId: string;
    documentId: string;
    tracker: ExtractEditalTracker;
};

type PrepareQueriesStep = {
    fieldQueryVectors: number[][];
    itemQueryVectors: number[][];
    queriesPreparationTimeMs: number;
    queryEmbeddingTokensUsed: number;
};

type ParseStep = {
    response: ProcessPdfResponse;
    entries: IndexEntry[];
    conversionTimeMs: number;
};

type IndexStep = {
    response: Partial<ProcessPdfResponse>;
    conversionTimeMs: number;
    entriesCount: number;
    indexingTimeMs: number;
    fromCache: boolean; // Retido, mas false pois Qdrant está configurado isolado
};

type ExtractInfoStep = IndexStep & {
    fields: { extraction: Record<string, any>; searchesPerformed: number; tokensUsed: any; hits: any[] };
    infoExtractionTimeMs: number;
};

type ExtractItensStep = ExtractInfoStep & {
    items: { itens: any[]; tokensUsed: any; tablesProcessed: number; totalHits: number };
    itensExtractionTimeMs: number;
};

export class ExtractEditalData {
    constructor(
        private readonly documentParser: DocumentHandlerFileParsingProvider.Contract,
        private readonly embeddingProvider: IEmbeddingProvider,
        private readonly vectorStore: IVectorStore.Contract,
        private readonly fieldExtractor: EditalFieldExtractorAgent,
        private readonly itemExtractor: EditalItemExtractorAgent,
        private readonly metricsProvider: MetricsProvider.Contract,
        private readonly sessionStorage: ExtractionSessionProvider,
        private readonly VECTOR_STORE_CONFIG: ExtractEditalData.VectorStoreConfig,
    ) { }

    async execute(input: ExtractEditalData.Input): Promise<ExtractEditalData.Output> {
        const ctx = await this.startStep(input);

        // Prepare query embeddings and parse PDF in parallel
        const [preparedQueries, parsedDocument] = await Promise.all([
            this.prepareQueriesStep(ctx),
            this.parseStep(ctx),
        ]);

        const { response: embedInfo, embeddedEntries, documentEmbeddingTokensUsed } = await this.embedDocumentStep(parsedDocument, ctx);
        const storedDocument = await this.storeDocumentStep(parsedDocument, embeddedEntries, ctx);

        // Search for field chunks and item chunks in parallel
        const [rawInfoChunks, rawItemChunks] = await Promise.all([
            this.getExtractInfoChunks(preparedQueries.fieldQueryVectors, ctx),
            this.getExtractItensChunks(preparedQueries.itemQueryVectors, ctx),
        ]);

        const infoChunks = this.cleanInfoChunksStep(rawInfoChunks);
        const itemChunks = this.cleanItemChunksStep(rawItemChunks);

        // Extract fields and items in parallel — they are independent
        const [infoResult, itemsResult] = await Promise.all([
            this.extractInfoStep(storedDocument, infoChunks, ctx),
            this.extractItensStep(itemChunks, ctx),
        ]);

        const withItens: ExtractItensStep = { ...infoResult, ...itemsResult };

        return this.endStep(withItens, parsedDocument, infoChunks, itemChunks, {
            ...ctx,
            prepareQueriesTimeMs: preparedQueries.queriesPreparationTimeMs,
            embeddingTimeMs: embedInfo.embeddingTimeMs,
            embeddingTokensUsed: preparedQueries.queryEmbeddingTokensUsed + documentEmbeddingTokensUsed,
        });
    }


    private async startStep(input: ExtractEditalData.Input): Promise<PipelineCtx> {
        const tracker = new ExtractEditalTracker(this.metricsProvider, input.onProgress ?? (() => { }));

        try {
            const { COLLECTION_NAME } = this.VECTOR_STORE_CONFIG;
            await this.vectorStore.ensureCollection(COLLECTION_NAME, {
                vectorSize: this.embeddingProvider.dimensions,
                payloadIndexFields: ["document_id", "type", "page", "table_index"],
            });
        } catch (err: any) {
            console.error(`[VectorStore] Falha ao configurar infra:`, err.message, err.cause ?? "");
            throw new Error(`Configuração do vector store falhou: ${err.message}`);
        }

        const sessionId = this.sessionStorage.newSessionId();
        const documentId = sessionId;
        console.log(`[Extrator Qdrant] Iniciando Nova Extração Isolada com Document ID: ${documentId}`);

        return { input, sessionId, documentId, tracker };
    }

    private async prepareQueriesStep({ tracker }: PipelineCtx): Promise<PrepareQueriesStep> {
        const step = tracker.prepareQueries();

        const fieldQueries = this.fieldExtractor.getSearchQueries();
        const itemQueries = this.itemExtractor.getSearchQueries();

        const [{ results: embeddedFields, tokensUsed: fieldTokens }, { results: embeddedItems, tokensUsed: itemTokens }] = await Promise.all([
            this.embeddingProvider.embedMany(fieldQueries.map(q => ({ id: q, embedInput: { content: q }, text: q })), true),
            this.embeddingProvider.embedMany(itemQueries.map(q => ({ id: q, embedInput: { content: q }, text: q })), true)
        ]);

        const fieldQueryVectors = embeddedFields.map(e => Array.from(e.embedding));
        const itemQueryVectors = embeddedItems.map(e => Array.from(e.embedding));

        return { fieldQueryVectors, itemQueryVectors, queriesPreparationTimeMs: step.done(), queryEmbeddingTokensUsed: fieldTokens + itemTokens };
    }

    private async parseStep({ input, sessionId, tracker }: PipelineCtx): Promise<ParseStep> {
        const step = tracker.parse();
        const { response, entries, wallTimeMs: apiTimeMs } = await this.documentParser.process(input.pdfBuffer, input.pdfUrl);
        return { response, entries, conversionTimeMs: step.done({ sessionId, apiMs: apiTimeMs }) };
    }

    private async embedDocumentStep({ entries }: ParseStep, { tracker }: PipelineCtx) {
        const step = tracker.embed();
        const { results: embeddedEntries, tokensUsed: documentEmbeddingTokensUsed } = await this.embeddingProvider.embedMany(entries);
        const embeddingTimeMs = step.done(embeddedEntries.length);
        return { response: { embeddingTimeMs }, embeddedEntries, documentEmbeddingTokensUsed };
    }

    private async storeDocumentStep({ response, conversionTimeMs }: ParseStep, embedded: { entry: IndexEntry; embedding: Float32Array | number[] }[], { documentId, tracker }: PipelineCtx): Promise<IndexStep> {
        const step = tracker.store();

        try {
            const points = embedded.map(({ entry, embedding }) => ({
                id: entry.id,
                vector: Array.from(embedding),
                payload: { text: entry.text, ...entry.metadata, document_id: documentId },
            }));

            if (points.length > 0) {
                console.log(`[Extrator Qdrant] Gravando ${points.length} pontos (dim: ${points[0].vector.length}) para doc: ${documentId}`);
            }

            await this.vectorStore.upsert(this.VECTOR_STORE_CONFIG.COLLECTION_NAME, points);
        } catch (err: any) {
            // Log detalhado agora é no QdrantVectorStore.ts
            throw err;
        }

        return { response, conversionTimeMs, entriesCount: embedded.length, indexingTimeMs: step.done(), fromCache: false };
    }

    private buildFilter(documentId: string, extra: IVectorStore.Condition[] = []): IVectorStore.Filter {
        return { must: [{ key: "document_id", match: { value: documentId } }, ...extra] };
    }

    private extractPayloads(results: IVectorStore.ScoredPoint[][]): (Record<string, any> & { score: number })[] {
        const hits = results.flat();
        const bestHits = new Map<string, IVectorStore.ScoredPoint>();

        for (const hit of hits) {
            const textKey = (hit.payload.text || "").trim().toLowerCase();
            const existing = bestHits.get(textKey);

            if (!existing || hit.score > existing.score) {
                bestHits.set(textKey, hit);
            }
        }

        return Array.from(bestHits.values()).map(hit => ({
            ...hit.payload,
            score: hit.score,
        }));
    }

    private cleanInfoChunksStep(chunks: { rawPayloads: (Record<string, any> & { score: number })[]; searchesPerformed: number }) {
        // 1. Agrupar chunks por seção
        const groupsMap = new Map<string, { totalScore: number; payloads: any[] }>();

        for (const p of chunks.rawPayloads) {
            const section = p.section || "Sem Seção";
            if (!groupsMap.has(section)) {
                groupsMap.set(section, { totalScore: 0, payloads: [] });
            }
            const group = groupsMap.get(section)!;
            group.totalScore += p.score;
            group.payloads.push(p);
        }

        // 2. Ordenar sessões pela soma de relevância e chunks internos por score individual
        const sortedGroups = Array.from(groupsMap.values())
            .sort((a, b) => b.totalScore - a.totalScore);

        for (const group of sortedGroups) {
            group.payloads.sort((a, b) => b.score - a.score);
        }

        // 3. Achatar para o formato final e limitar a quantidade
        const payloads = sortedGroups
            .flatMap(g => g.payloads.map(p => ({
                page: p.page,
                section: p.section,
                text: p.text,
                score: p.score,
            })))


        return { payloads, searchesPerformed: chunks.searchesPerformed };
    }

    private cleanItemChunksStep(chunks: { rawPayloads: Record<string, any>[] }) {
        const payloads = [...chunks.rawPayloads]
            .sort((a, b) => {
                if (a.page !== b.page) return a.page - b.page;
                if (a.table_index !== b.table_index) return a.table_index - b.table_index;
                return (a.row_index ?? 0) - (b.row_index ?? 0);
            })
            .map(p => ({
                page: p.page,
                table_index: p.table_index,
                row_index: p.row_index,
                headers: p.headers,
                text: p.text,
            }));
        return { payloads, tablesProcessed: payloads.length };
    }

    private async getExtractInfoChunks(queryVectors: number[][], { documentId }: PipelineCtx) {
        const { COLLECTION_NAME, FIELD_SEARCH_LIMIT, FIELD_SCORE_THRESHOLD } = this.VECTOR_STORE_CONFIG;
        const results = await this.vectorStore.searchBatch(COLLECTION_NAME, queryVectors, {
            limit: FIELD_SEARCH_LIMIT,
            filter: this.buildFilter(documentId),
            minScore: FIELD_SCORE_THRESHOLD,
        });

        return { rawPayloads: this.extractPayloads(results), searchesPerformed: queryVectors.length };
    }

    private headerSignature(headers: unknown): string {
        if (!Array.isArray(headers) || headers.length === 0) return "";
        return headers.map(h => String(h).replace(/\*\*/g, "").trim().toLowerCase()).join("|");
    }

    private async getExtractItensChunks(_queryVectors: number[][], { documentId }: PipelineCtx) {
        const { COLLECTION_NAME, ITEM_TYPE_FILTER } = this.VECTOR_STORE_CONFIG;
        const typeCondition: IVectorStore.Condition = { key: "type", match: { any: ITEM_TYPE_FILTER } };
        const docFilter = this.buildFilter(documentId, [typeCondition]);

        // Step 1: Paginated scroll over ALL table rows of this document.
        // Group rows by (page, table_index).
        const tableGroups = new Map<string, Record<string, any>[]>();

        let offset: string | number | undefined = undefined;
        do {
            const { points, nextOffset } = await this.vectorStore.scroll(COLLECTION_NAME, {
                limit: 1000,
                filter: docFilter,
                offset,
            });
            for (const p of points) {
                const { page, table_index } = p.payload;
                if (page != null && table_index != null) {
                    const key = `${page}_${table_index}`;
                    if (!tableGroups.has(key)) tableGroups.set(key, []);
                    tableGroups.get(key)!.push(p.payload);
                }
            }
            offset = nextOffset ?? undefined;
        } while (offset != null);

        // Step 2: Include only tables with more than 3 columns.
        const allRows: Record<string, any>[] = [];
        let matchedTables = 0;

        for (const [, rows] of tableGroups) {
            const firstRow = rows[0];
            const headers = firstRow?.headers;
            let cols = Array.isArray(headers) ? headers.length : 0;

            // Fallback: Many tables don't have explicit headers, but their data rows have columns.
            if (cols === 0 && firstRow?.text) {
                try {
                    const data = JSON.parse(firstRow.text);
                    cols = Array.isArray(data) ? data.length : Object.keys(data ?? {}).length;
                } catch {
                    // Ignore parse errors, fallback to cols=0
                }
            }

            if (cols > 3) {
                allRows.push(...rows);
                matchedTables++;
            }
        }

        console.log(`[getExtractItensChunks] ${allRows.length} linhas de ${matchedTables} tabelas (filtro: > 3 colunas).`);
        return { rawPayloads: allRows };
    }


    private async extractInfoStep(prev: IndexStep, infoContext: { payloads: Record<string, any>[]; searchesPerformed: number }, { tracker }: PipelineCtx): Promise<ExtractInfoStep> {
        const step = tracker.extractInfo();
        const { data: extraction, metrics } = await this.fieldExtractor.extract(infoContext.payloads, step.relay);
        const partialLicitacao = EditalExtractionMapper.toLicitacao(extraction, []);
        tracker.emitPartialInfo(extraction, partialLicitacao);

        const fields = { extraction, hits: [], searchesPerformed: infoContext.searchesPerformed, tokensUsed: metrics.tokensUsed };
        return { ...prev, fields, infoExtractionTimeMs: step.done() };
    }

    private async extractItensStep(itemsContext: { payloads: Record<string, any>[]; tablesProcessed: number }, { tracker }: PipelineCtx): Promise<Pick<ExtractItensStep, "items" | "itensExtractionTimeMs">> {
        const step = tracker.extractItens();
        const { data: itens, metrics } = await this.itemExtractor.extract(itemsContext.payloads, step.relay, step.relayBatch);
        tracker.emitPartialItems(itens);

        const itemsObj = { itens: itens, tokensUsed: metrics.tokensUsed, tablesProcessed: itemsContext.tablesProcessed, totalHits: 0 };
        return { items: itemsObj, itensExtractionTimeMs: step.done(itens.length) };
    }

    private async endStep(
        extracted: ExtractItensStep,
        parsedDocument: ParseStep,
        infoChunks: { payloads: Record<string, any>[]; searchesPerformed: number },
        itemChunks: { payloads: Record<string, any>[]; tablesProcessed: number },
        { input, sessionId, documentId, tracker, prepareQueriesTimeMs, embeddingTimeMs, embeddingTokensUsed }: PipelineCtx & { prepareQueriesTimeMs: number; embeddingTimeMs: number; embeddingTokensUsed: number }
    ): Promise<ExtractEditalData.Output> {
        tracker.emitMap();

        const mdContent = parsedDocument.response.sections
            .flatMap(s => s.chunks.map(c => c.text))
            .join("\n\n---\n\n");

        const licitacao = EditalExtractionMapper.toLicitacao(extracted.fields.extraction, extracted.items.itens);

        tracker.emitSave(documentId);
        const totalTimeMs = tracker.finishTotal({ sessionId });
        const metrics = this.buildMetrics({
            sessionId,
            pdfUrl: input.pdfUrl,
            totalTimeMs,
            prepareQueriesTimeMs,
            embeddingTimeMs,
            embeddingTokensUsed,
            chunksEnviados: {
                agenteCampos: infoChunks.payloads.length,
                agenteItens: itemChunks.payloads.length,
            },
            ...extracted,
        });


        await this.sessionStorage.save({
            sessionId,
            pdfBuffer: input.pdfBuffer,
            mdContent,
            fieldPayloads: infoChunks.payloads,
            itemPayloads: itemChunks.payloads,
            rawFields: extracted.fields.extraction,
            rawItems: extracted.items.itens,
            extraction: licitacao,
            metrics,
            searchQueries: {
                field: this.fieldExtractor.getSearchQueries(),
                item: this.itemExtractor.getSearchQueries(),
            },
            qdrantConfig: {
                collection: this.VECTOR_STORE_CONFIG.COLLECTION_NAME,
                documentId,
                fieldSearchLimit: this.VECTOR_STORE_CONFIG.FIELD_SEARCH_LIMIT,
                fieldScoreThreshold: this.VECTOR_STORE_CONFIG.FIELD_SCORE_THRESHOLD,
                itemSearchLimit: this.VECTOR_STORE_CONFIG.ITEM_SEARCH_LIMIT,
                itemScoreThreshold: this.VECTOR_STORE_CONFIG.ITEM_SCORE_THRESHOLD,
                itemTypeFilter: this.VECTOR_STORE_CONFIG.ITEM_TYPE_FILTER,
            },
        });

        return { sessionId, mdContent, licitacao, metrics };
    }

    private buildMetrics(args: {
        sessionId: string;
        pdfUrl?: string;
        totalTimeMs: number;
        prepareQueriesTimeMs: number;
        embeddingTimeMs: number;
        embeddingTokensUsed: number;
        chunksEnviados: { agenteCampos: number; agenteItens: number };
    } & ExtractItensStep): ExtractEditalDataControllerSchemas.Metrics {
        const { sessionId, pdfUrl, response, entriesCount, conversionTimeMs, indexingTimeMs, embeddingTimeMs, prepareQueriesTimeMs, embeddingTokensUsed, infoExtractionTimeMs, itensExtractionTimeMs, totalTimeMs, fields, items, fromCache, chunksEnviados } = args;

        return {
            sessionId,
            timestamp: new Date().toISOString(),
            pdfUrl: pdfUrl ?? "upload-direto",
            pdfFilename: response.filename ?? "cached_file",
            pdfFileSizeBytes: response.file_size_bytes ?? 0,
            totalChars: response.total_chars ?? 0,
            totalWords: response.total_words ?? 0,
            totalTables: response.total_tables ?? 0,
            entriesIndexed: entriesCount,
            conversionTimeMs,
            indexingTimeMs,
            embeddingTimeMs,
            prepareQueriesTimeMs,
            extractionTimeMs: infoExtractionTimeMs + itensExtractionTimeMs,
            totalTimeMs,
            tempDir: this.sessionStorage.tempDirFor(sessionId),
            tokensUsed: {
                prompt: fields.tokensUsed.prompt + items.tokensUsed.prompt,
                completion: fields.tokensUsed.completion + items.tokensUsed.completion,
                total: fields.tokensUsed.total + items.tokensUsed.total,
            },
            embeddingTokensUsed,
            chunksEnviados,
            vectorStoreConfig: {
                collection: this.VECTOR_STORE_CONFIG.COLLECTION_NAME,
                vectorSize: this.embeddingProvider.dimensions,
                fieldSearchLimit: this.VECTOR_STORE_CONFIG.FIELD_SEARCH_LIMIT,
                fieldScoreThreshold: this.VECTOR_STORE_CONFIG.FIELD_SCORE_THRESHOLD,
                itemSearchLimit: this.VECTOR_STORE_CONFIG.ITEM_SEARCH_LIMIT,
                itemScoreThreshold: this.VECTOR_STORE_CONFIG.ITEM_SCORE_THRESHOLD,
                itemTypeFilter: this.VECTOR_STORE_CONFIG.ITEM_TYPE_FILTER,
            },
            config: {
                embeddingModel: this.embeddingProvider.modelName,
                aiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
                fileParser: this.documentParser.constructor.name,
                extractionMode: fromCache ? "Vector Agent (Qdrant Cached)" : "Vector Agent (Desacoplado)",
                totalQueries: fields.searchesPerformed,
            },
        };
    }
}

export namespace ExtractEditalData {
    export type VectorStoreConfig = {
        /** Nome da coleção no Qdrant onde os chunks do edital são indexados. */
        COLLECTION_NAME: string;
        /** Número máximo de chunks de texto retornados por query de busca do agente de campos. */
        FIELD_SEARCH_LIMIT: number;
        /** Score mínimo de similaridade coseno (0–1) para um chunk de texto ser incluído no contexto do agente de campos. */
        FIELD_SCORE_THRESHOLD: number;
        /** Número máximo de linhas de tabela retornadas por query de busca do agente de itens. */
        ITEM_SEARCH_LIMIT: number;
        /** Score mínimo de similaridade coseno (0–1) para uma linha de tabela ser incluída no contexto do agente de itens. */
        ITEM_SCORE_THRESHOLD: number;
        /** Tipos de payload aceitos na busca de itens. Filtra apenas chunks que representam tabelas. */
        ITEM_TYPE_FILTER: string[];
    };

    export type ProgressEvent = {
        step: string;
        message: string;
        percent: number;
        partialData?: any;
    };

    export interface Input {
        pdfBuffer: Buffer;
        pdfUrl?: string;
        onProgress?: (event: ProgressEvent) => void;
    }

    export type Output = ExtractEditalDataControllerSchemas.Output;
}
