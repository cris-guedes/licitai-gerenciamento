import type { IEmbeddingProvider } from "@/server/modules/core-api/domain/data/IEmbeddingProvider";
import type { IVectorStore } from "@/server/modules/core-api/domain/data/IVectorStore";
import type { MetricsProvider } from "@/server/shared/infra/providers/metrics/metrics-provider";
import type { ExtractionSessionProvider } from "@/server/shared/infra/providers/session/extraction-session-provider";
import { ExtractEditalDataControllerSchemas } from "./ExtractEditalDataControllerSchemas";
import { EditalExtractionMapper } from "./dtos/EditalExtractionMapper";
import { ExtractEditalTracker } from "./utils/ExtractEditalTracker";
import { ExtractInfoPipeline, ExtractInfoPipelineResult } from "./pipelines/ExtractInfoPipeline";
import { ExtractItemsPipeline, ExtractItemsPipelineResult } from "./pipelines/ExtractItemsPipeline";

export class ExtractEditalData {
    constructor(
        private readonly infoPipeline: ExtractInfoPipeline,
        private readonly itemsPipeline: ExtractItemsPipeline,
        private readonly embeddingProvider: IEmbeddingProvider,
        private readonly sessionStorage: ExtractionSessionProvider,
        private readonly metricsProvider: MetricsProvider.Contract,
        private readonly vectorStoreConfig: ExtractEditalData.VectorStoreConfig,
    ) { }

    async execute(input: ExtractEditalData.Input): Promise<ExtractEditalData.Output> {
        const tracker = new ExtractEditalTracker(this.metricsProvider, input.onProgress ?? (() => { }));
        const sessionId = this.sessionStorage.newSessionId();
        const documentId = input.externalId ?? sessionId;

        console.log(`[ExtractEditalData] Iniciando Pipelines em paralelo — documentId: ${documentId}`);

        const context = { input, sessionId, documentId, tracker };

        // Dispara as duas pipelines de maneira paralela. 
        // Cada pipeline é independente e gerencia seu próprio worker (Pdf vs Table).
        // As respostas permanecem separadas até o método finish.
        const [infoResult, itemsResult] = await Promise.all([
            this.infoPipeline.execute({
                pdfBuffer: input.pdfBuffer,
                documentId,
                tracker,
                config: this.vectorStoreConfig,
            }),
            this.itemsPipeline.execute({
                pdfBuffer: input.pdfBuffer,
                documentId,
                tracker,
                config: this.vectorStoreConfig,
            }),
        ]);

        return this.finish(infoResult, itemsResult, context);
    }

    private async finish(
        info: ExtractInfoPipelineResult,
        items: ExtractItemsPipelineResult,
        context: { input: ExtractEditalData.Input; sessionId: string; documentId: string; tracker: ExtractEditalTracker }
    ): Promise<ExtractEditalData.Output> {
        const { sessionId, documentId, tracker, input } = context;
        const config = this.vectorStoreConfig;

        tracker.emitMap();
        // União dos dados extraídos apenas após a conclusão de ambas as pipelines
        const licitacao = EditalExtractionMapper.toLicitacao(info.extraction, items.itens);

        tracker.emitSave(documentId);
        const totalTimeMs = tracker.finishTotal({ sessionId });

        // Cálculo de tokens (incluindo o passo de prettify de ambas as pipelines)
        const embeddingTokensUsed = info.ingestionResult.embeddingTokensUsed + items.ingestionResult.embeddingTokensUsed;

        const metrics: ExtractEditalDataControllerSchemas.Metrics = {
            sessionId,
            timestamp: new Date().toISOString(),
            pdfUrl: input.externalId ?? "upload-direto",
            pdfFilename: documentId,
            pdfFileSizeBytes: input.pdfBuffer.byteLength,
            totalChars: info.ingestionResult.totalChars,
            totalWords: info.ingestionResult.totalWords,
            totalTables: 0,
            entriesIndexed: info.ingestionResult.entriesCount + items.ingestionResult.entriesCount,
            conversionTimeMs: info.ingestionResult.parseTimeMs,
            indexingTimeMs: info.ingestionResult.indexingTimeMs,
            embeddingTimeMs: info.ingestionResult.embeddingTimeMs,
            prepareQueriesTimeMs: 0,
            extractionTimeMs: info.timeMs + items.timeMs,
            totalTimeMs,
            tempDir: this.sessionStorage.tempDirFor(sessionId),
            tokensUsed: {
                prompt: info.tokensUsed.prompt + items.tokensUsed.prompt + info.prettifyMetrics.prompt + items.prettifyMetrics.prompt,
                completion: info.tokensUsed.completion + items.tokensUsed.completion + info.prettifyMetrics.completion + items.prettifyMetrics.completion,
                total: info.tokensUsed.total + items.tokensUsed.total + info.prettifyMetrics.total + items.prettifyMetrics.total,
            },
            embeddingTokensUsed,
            chunksEnviados: { agenteCampos: info.searchCount, agenteItens: items.itens.length },
            vectorStoreConfig: {
                collection: config.COLLECTION_NAME,
                vectorSize: this.embeddingProvider.dimensions,
                fieldSearchLimit: config.FIELD_SEARCH_LIMIT,
                fieldScoreThreshold: config.FIELD_SCORE_THRESHOLD,
                itemSearchLimit: config.ITEM_SEARCH_LIMIT,
                itemScoreThreshold: config.ITEM_SCORE_THRESHOLD,
                itemTypeFilter: ["table_row"],
            },
            config: {
                embeddingModel: this.embeddingProvider.modelName,
                aiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
                fileParser: "Pipelines Segregadas + Prettify",
                extractionMode: "Info (PdfWorker) + Items (TableWorker)",
                totalQueries: info.searchCount + items.itens.length,
            },
        };

        // mdContent agora usa o RAW formatado (Prettified) vindo de ambas as pipelines
        const mdContent = (info.ingestionResult.prettifiedRaw || "") + "\n\n" + (items.ingestionResult.prettifiedRaw || "");

        await this.sessionStorage.save({
            sessionId,
            pdfBuffer: input.pdfBuffer,
            mdContent,
            parsedTextEntries: info.ingestionResult.entries,
            parsedTableEntries: items.ingestionResult.entries,
            fieldPayloads: info.infoChunks.payloads,
            itemPayloads: items.itemChunks.payloads,
            rawFields: info.extraction,
            rawItems: items.itens,
            extraction: licitacao,
            metrics,
            searchQueries: { field: [], item: [] },
            qdrantConfig: {
                collection: config.COLLECTION_NAME,
                documentId,
                fieldSearchLimit: config.FIELD_SEARCH_LIMIT,
                fieldScoreThreshold: config.FIELD_SCORE_THRESHOLD,
                itemSearchLimit: config.ITEM_SEARCH_LIMIT,
                itemScoreThreshold: config.ITEM_SCORE_THRESHOLD,
                itemTypeFilter: ["table_row"],
            },
        });

        return { sessionId, mdContent, licitacao, metrics };
    }
}

export namespace ExtractEditalData {
    export type VectorStoreConfig = {
        COLLECTION_NAME: string;
        FIELD_SEARCH_LIMIT: number;
        FIELD_SCORE_THRESHOLD: number;
        ITEM_SEARCH_LIMIT: number;
        ITEM_SCORE_THRESHOLD: number;
        ITEM_SCROLL_BATCH_SIZE: number;
        ITEM_SCROLL_SCORE: number;
        ITEM_EXTRACTION_CONCURRENCY: number;
        EMBEDDING_CONCURRENCY?: number;
        STORE_CONCURRENCY?: number;
    };

    export type ProgressEvent = {
        step: string;
        message: string;
        percent: number;
    };

    export interface Input {
        pdfBuffer: Buffer;
        externalId?: string;
        onProgress?: (event: ProgressEvent) => void;
    }

    export type Output = ExtractEditalDataControllerSchemas.Output;
}
