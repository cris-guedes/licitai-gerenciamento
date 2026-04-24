import type { IEmbeddingProvider } from "@/server/modules/core-api/domain/data/IEmbeddingProvider";
import type { MetricsProvider } from "@/server/shared/infra/providers/metrics/metrics-provider";
import type { ExtractionSessionProvider } from "@/server/shared/infra/providers/session/extraction-session-provider";
import { performance } from "perf_hooks";
import { ExtractEditalDataControllerSchemas } from "./ExtractEditalDataControllerSchemas";
import { EditalExtractionMapper } from "./dtos/EditalExtractionMapper";
import { ExtractEditalTracker } from "./utils/ExtractEditalTracker";
import { ExtractInfoPipeline, type ExtractInfoPipelineResult } from "./pipelines/ExtractInfoPipeline";
import { ExtractItemsPipeline, type ExtractItemsPipelineResult } from "./pipelines/ExtractItemsPipeline";

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
        let latestInfoResult: ExtractInfoPipelineResult | null = null;
        let partialItems: any[] = [];

        console.log(`[ExtractEditalData] Iniciando Pipelines em paralelo — documentId: ${documentId}`);

        const pipelinesStartedAt = performance.now();
        const infoPromise = this.infoPipeline.execute({
            pdfBuffer: input.pdfBuffer,
            documentId,
            tracker,
            config: this.vectorStoreConfig,
        }).then(async result => {
            latestInfoResult = result;

            await input.onInfoPartial?.({
                type: "partial_info",
                scope: "info",
                step: "info.partial",
                message: "Extração de informações concluída",
                percent: 70,
                pipelinePercent: 100,
                partialItemsCount: partialItems.length,
                result: this.buildPartialOutput(sessionId, result, partialItems),
            });

            return result;
        });

        const itemsPromise = this.itemsPipeline.execute({
            pdfBuffer: input.pdfBuffer,
            documentId,
            tracker,
            config: this.vectorStoreConfig,
            onBatchCompleted: async batch => {
                partialItems = batch.cumulativeItems;

                const batchItems = this.mapPartialItems(batch.batchItems);
                const cumulativeItems = this.mapPartialItems(batch.cumulativeItems);

                await input.onItemsBatchPartial?.({
                    type: "partial_items_batch",
                    scope: "items",
                    step: "items.partial_batch",
                    message: `Lote ${batch.batchIndex}/${batch.totalBatches} concluído`,
                    percent: 72 + Math.round((batch.completedBatches / batch.totalBatches) * 13),
                    pipelinePercent: 85 + Math.round((batch.completedBatches / batch.totalBatches) * 15),
                    batch: {
                        batchIndex: batch.batchIndex,
                        totalBatches: batch.totalBatches,
                        completedBatches: batch.completedBatches,
                        batchTimeMs: batch.batchTimeMs,
                        batchPayloadCount: batch.batchPayloadCount,
                        batchPayloadChars: batch.batchPayloadChars,
                        batchItems,
                        cumulativeItems,
                        cumulativeItemsCount: cumulativeItems.length,
                    },
                    result: this.buildPartialOutput(sessionId, latestInfoResult, batch.cumulativeItems),
                });
            },
        });

        const [infoResult, itemsResult] = await Promise.all([
            infoPromise,
            itemsPromise,
        ]);
        const pipelinesTimeMs = performance.now() - pipelinesStartedAt;

        return this.finish(infoResult, itemsResult, {
            input,
            sessionId,
            documentId,
            tracker,
            pipelinesTimeMs,
        });
    }

    private async finish(
        info: ExtractInfoPipelineResult,
        items: ExtractItemsPipelineResult,
        context: {
            input: ExtractEditalData.Input;
            sessionId: string;
            documentId: string;
            tracker: ExtractEditalTracker;
            pipelinesTimeMs: number;
        }
    ): Promise<ExtractEditalData.Output> {
        const { sessionId, documentId, tracker, input, pipelinesTimeMs } = context;

        tracker.emitMap();
        const mapStartedAt = performance.now();
        const licitacao = EditalExtractionMapper.toLicitacao(info.extraction, items.itens);
        const mapTimeMs = performance.now() - mapStartedAt;

        const totalAgentTokens = {
            prompt: info.tokensUsed.prompt + items.tokensUsed.prompt + info.prettifyMetrics.prompt + items.prettifyMetrics.prompt,
            completion: info.tokensUsed.completion + items.tokensUsed.completion + info.prettifyMetrics.completion + items.prettifyMetrics.completion,
            total: info.tokensUsed.total + items.tokensUsed.total + info.prettifyMetrics.total + items.prettifyMetrics.total,
        };

        const embeddingTokensUsed =
            info.ingestionResult.embeddingTokensUsed +
            items.ingestionResult.embeddingTokensUsed +
            info.metrics.prepareQueries.embeddingTokensUsed +
            items.metrics.prepareQueries.embeddingTokensUsed;

        const mdContent = `${info.ingestionResult.prettifiedRaw || ""}\n\n${items.ingestionResult.prettifiedRaw || ""}`;
        // artifacts = this.sessionStorage.artifactPathsFor(sessionId);

        tracker.emitSave(documentId);
        const saveStartedAt = performance.now();
        /* await this.sessionStorage.saveArtifacts({
             sessionId,
             pdfBuffer: input.pdfBuffer,
             parsedTextEntries: info.ingestionResult.entries,
             parsedTableEntries: items.ingestionResult.entries,
             fieldPayloads: info.infoChunks.payloads,
             itemPayloads: items.itemChunks.payloads,
             rawItems: items.itens,
             extraction: licitacao,
         });*/
        const saveTimeMs = performance.now() - saveStartedAt;
        const totalTimeMs = tracker.finishTotal({ sessionId });
        const detail = (label: string, value: string | number) => ({ label, value: String(value) });
        const infoPreparationTimeMs = Math.max(info.ingestionResult.totalTimeMs, info.metrics.prepareQueries.totalTimeMs);
        const itemsPreparationTimeMs = Math.max(items.ingestionResult.totalTimeMs, items.metrics.prepareQueries.totalTimeMs);

        const metrics: ExtractEditalDataControllerSchemas.Metrics = {
            sessionId,
            timestamp: new Date().toISOString(),
            pdfFilename: documentId,
            pdfFileSizeBytes: input.pdfBuffer.byteLength,
            totalWords: info.ingestionResult.totalWords,
            entriesIndexed: info.ingestionResult.entriesCount + items.ingestionResult.entriesCount,
            itemsExtracted: items.itens.length,
            totalTimeMs,
            tokensUsed: totalAgentTokens,
            embeddingTokensUsed,
            chunksEnviados: {
                agenteCampos: info.infoChunks.payloads.length,
                agenteItens: items.itemChunks.payloads.length,
            },
            artifacts: {
                directory: "",
                originalPdf: "",
                pdfProcessingResponse: "",
                aiInputs: "",
                extractionResult: "",
                metrics: ""
            },
            steps: {
                orchestration: {
                    label: "Orquestração",
                    totalTimeMs: pipelinesTimeMs + mapTimeMs + saveTimeMs,
                    steps: [
                        {
                            id: "parallel_pipelines",
                            label: "Executar pipelines em paralelo",
                            timeMs: pipelinesTimeMs,
                            details: [
                                detail("Pipeline de campos", this.formatMs(info.metrics.totalTimeMs)),
                                detail("Pipeline de itens", this.formatMs(items.metrics.totalTimeMs)),
                                detail("Ganho do paralelismo", this.formatMs(Math.max(0, info.metrics.totalTimeMs + items.metrics.totalTimeMs - pipelinesTimeMs))),
                            ],
                        },
                        {
                            id: "map_result",
                            label: "Mapear resultado final",
                            timeMs: mapTimeMs,
                            details: [
                                detail("Itens consolidados", items.itens.length.toLocaleString("pt-BR")),
                            ],
                        },
                    ],
                },
                info: {
                    label: "Pipeline de campos",
                    totalTimeMs: info.metrics.totalTimeMs,
                    steps: [
                        {
                            id: "prepare_pipeline",
                            label: "Preparar pipeline de campos",
                            timeMs: infoPreparationTimeMs,
                            details: [
                                detail("PDF -> chunks", this.formatMs(info.ingestionResult.parseTimeMs)),
                                detail("Embedding", this.formatMs(info.ingestionResult.embeddingTimeMs)),
                                detail("Indexação", this.formatMs(info.ingestionResult.indexingTimeMs)),
                                detail("Queries", this.formatMs(info.metrics.prepareQueries.totalTimeMs)),
                                detail("Chunks indexados", info.ingestionResult.entriesCount.toLocaleString("pt-BR")),
                                detail("Consultas", info.metrics.prepareQueries.queryCount.toLocaleString("pt-BR")),
                            ],
                        },
                        {
                            id: "search_chunks",
                            label: "Buscar chunks para campos",
                            timeMs: info.metrics.search.totalTimeMs,
                            details: [
                                detail("Chunks selecionados", info.metrics.search.selectedHits.toLocaleString("pt-BR")),
                                detail("Chunks únicos", info.metrics.search.uniqueHits.toLocaleString("pt-BR")),
                            ],
                        },
                        {
                            id: "extract_fields",
                            label: "Extrair campos com IA",
                            timeMs: info.metrics.extraction.totalTimeMs,
                            details: [
                                detail("Chunks enviados", info.metrics.extraction.payloadCount.toLocaleString("pt-BR")),
                                detail("Tokens de IA", info.metrics.extraction.totalTokens.toLocaleString("pt-BR")),
                            ],
                        },
                    ],
                },
                items: {
                    label: "Pipeline de itens",
                    totalTimeMs: items.metrics.totalTimeMs,
                    steps: [
                        {
                            id: "prepare_pipeline",
                            label: "Preparar pipeline de itens",
                            timeMs: itemsPreparationTimeMs,
                            details: [
                                detail("PDF -> linhas", this.formatMs(items.ingestionResult.parseTimeMs)),
                                detail("Embedding", this.formatMs(items.ingestionResult.embeddingTimeMs)),
                                detail("Indexação", this.formatMs(items.ingestionResult.indexingTimeMs)),
                                detail("Queries", this.formatMs(items.metrics.prepareQueries.totalTimeMs)),
                                detail("Linhas indexadas", items.ingestionResult.entriesCount.toLocaleString("pt-BR")),
                                detail("Consultas", items.metrics.prepareQueries.queryCount.toLocaleString("pt-BR")),
                            ],
                        },
                        {
                            id: "search_chunks",
                            label: "Buscar linhas para itens",
                            timeMs: items.metrics.search.totalTimeMs,
                            details: [
                                detail("Linhas selecionadas", items.metrics.search.selectedHits.toLocaleString("pt-BR")),
                                detail("Linhas válidas", items.metrics.search.filteredHits.toLocaleString("pt-BR")),
                            ],
                        },
                        {
                            id: "build_batches",
                            label: "Montar lotes para IA",
                            timeMs: items.metrics.batching.totalTimeMs,
                            details: [
                                detail("Lotes", items.metrics.batching.batchCount.toLocaleString("pt-BR")),
                                detail("Carga total", `${Math.round(items.metrics.batching.totalPayloadChars / 1024)} KB`),
                            ],
                        },
                        {
                            id: "extract_items",
                            label: "Extrair itens com IA",
                            timeMs: items.metrics.extraction.totalTimeMs,
                            details: [
                                detail("Chunks enviados", items.metrics.extraction.payloadCount.toLocaleString("pt-BR")),
                                detail("Itens extraídos", items.metrics.extraction.uniqueItemsCount.toLocaleString("pt-BR")),
                                detail("Tokens de IA", items.metrics.extraction.totalTokens.toLocaleString("pt-BR")),
                            ],
                        },
                    ],
                },
            },
        };

        await this.sessionStorage.saveMetrics({
            sessionId,
            metrics,
            extraction: licitacao,
            rawItems: items.itens,
            fieldPayloads: info.infoChunks.payloads,
            itemPayloads: items.itemChunks.payloads,
        });

        return { sessionId, mdContent, licitacao, metrics };
    }

    private formatMs(ms: number): string {
        return `${(ms / 1000).toFixed(1)}s`;
    }

    private buildPartialOutput(
        sessionId: string,
        info: ExtractInfoPipelineResult | null,
        rawItems: any[],
    ): ExtractEditalData.PartialOutput {
        return {
            sessionId,
            mdContent: info?.ingestionResult.prettifiedRaw ?? info?.ingestionResult.raw ?? "",
            licitacao: EditalExtractionMapper.toLicitacao(info?.extraction ?? {}, rawItems),
        };
    }

    private mapPartialItems(rawItems: any[]) {
        return EditalExtractionMapper.toLicitacao({}, rawItems).edital?.itens ?? [];
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
        type: "progress";
        scope: "info" | "items" | "orchestration";
        step: string;
        message: string;
        percent: number;
        pipelinePercent?: number;
    };

    export type PartialOutput = Pick<Output, "sessionId" | "mdContent" | "licitacao">;

    export type InfoPartialEvent = {
        type: "partial_info";
        scope: "info";
        step: string;
        message: string;
        percent: number;
        pipelinePercent: number;
        partialItemsCount: number;
        result: PartialOutput;
    };

    export type ItemsBatchPartialEvent = {
        type: "partial_items_batch";
        scope: "items";
        step: string;
        message: string;
        percent: number;
        pipelinePercent: number;
        batch: {
            batchIndex: number;
            totalBatches: number;
            completedBatches: number;
            batchTimeMs: number;
            batchPayloadCount: number;
            batchPayloadChars: number;
            batchItems: any[];
            cumulativeItems: any[];
            cumulativeItemsCount: number;
        };
        result: PartialOutput;
    };

    export interface Input {
        pdfBuffer: Buffer;
        externalId?: string;
        onProgress?: (event: ProgressEvent) => void;
        onInfoPartial?: (event: InfoPartialEvent) => void | Promise<void>;
        onItemsBatchPartial?: (event: ItemsBatchPartialEvent) => void | Promise<void>;
    }

    export type Output = ExtractEditalDataControllerSchemas.Output;
}
