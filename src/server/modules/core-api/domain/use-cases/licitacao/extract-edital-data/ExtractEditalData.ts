import type { IIdentifierProvider } from "@/server/modules/core-api/domain/data/IIdentifierProvider";
import type { IObjectStorageProvider } from "@/server/modules/core-api/domain/data/IObjectStorageProvider";
import type { MetricsProvider } from "@/server/shared/infra/providers/metrics/metrics-provider";
import type { ExtractionSessionProvider } from "@/server/shared/infra/providers/session/extraction-session-provider";
import { DocumentAnalysisStatus, DocumentAnalysisType, DocumentStatus, DocumentType, Prisma } from "@prisma/client";
import { performance } from "perf_hooks";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentAnalysisRepository } from "@/server/shared/infra/repositories/document-analysis.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import { ExtractEditalDataControllerSchemas } from "./ExtractEditalDataControllerSchemas";
import { EditalExtractionMapper } from "./dtos/EditalExtractionMapper";
import { ExtractEditalTracker } from "./utils/ExtractEditalTracker";
import { ExtractInfoPipeline, type ExtractInfoPipelineResult } from "./pipelines/ExtractInfoPipeline";
import { ExtractItemsPipeline, type ExtractItemsPipelineResult } from "./pipelines/ExtractItemsPipeline";

export class ExtractEditalData {
    constructor(
        private readonly infoPipeline: ExtractInfoPipeline,
        private readonly itemsPipeline: ExtractItemsPipeline,
        private readonly sessionStorage: ExtractionSessionProvider,
        private readonly metricsProvider: MetricsProvider.Contract,
        private readonly vectorStoreConfig: ExtractEditalData.VectorStoreConfig,
        private readonly identifierProvider: IIdentifierProvider,
        private readonly objectStorageProvider: IObjectStorageProvider.Contract,
        private readonly documentRepository: PrismaDocumentRepository,
        private readonly documentAnalysisRepository: PrismaDocumentAnalysisRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) { }

    async execute(input: ExtractEditalData.Input): Promise<ExtractEditalData.Output> {
        const companyId = await this.authorizeCompanyAccess(input);
        const context = this.createExecutionContext(input, companyId);

        try {
            await this.storeSourceDocument(context);
            await this.createDocumentRecord(context);
            await this.createAnalysisRecord(context);

            const pipelineResults = await this.runExtractionPipelines(context);
            const output = await this.buildFinalOutput(context, pipelineResults);

            await this.markDocumentAsReady(context);
            await this.markAnalysisAsCompleted(context, output);

            return output;
        } catch (error) {
            await this.handleExecutionFailure(context, error);
            throw error;
        }
    }

    private async authorizeCompanyAccess(input: ExtractEditalData.Input): Promise<string> {
        const company = await assertUserCanAccessCompany({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: input.userId,
            companyId: input.companyId,
        });

        return company.id;
    }

    private createExecutionContext(
        input: ExtractEditalData.Input,
        companyId: string,
    ): ExtractEditalData.ExecutionContext {
        const documentId = input.externalId ?? this.identifierProvider.generate();

        return {
            input,
            companyId,
            documentId,
            sessionId: this.sessionStorage.newSessionId(),
            tracker: new ExtractEditalTracker(this.metricsProvider, input.onProgress ?? (() => { })),
            originalFilename: input.pdfFilename?.trim() || `${documentId}.pdf`,
            mimeType: input.pdfMimeType?.trim() || "application/pdf",
            documentSizeBytes: input.pdfFileSizeBytes ?? input.pdfBuffer.byteLength,
            logicalStorageKey: this.buildStorageKey(companyId, documentId),
            storedDocument: null,
            documentCreated: false,
            analysisId: null,
            latestInfoResult: null,
            partialItems: [],
        };
    }

    private async storeSourceDocument(context: ExtractEditalData.ExecutionContext): Promise<void> {
        context.storedDocument = await this.objectStorageProvider.putDocument({
            key: context.logicalStorageKey,
            body: context.input.pdfBuffer,
            filename: context.originalFilename,
            contentType: context.mimeType,
            metadata: this.buildStorageMetadata(context),
        });
    }

    private buildStorageMetadata(context: ExtractEditalData.ExecutionContext) {
        return {
            companyId: context.companyId,
            documentId: context.documentId,
            ...(context.input.createdById ? { createdById: context.input.createdById } : {}),
        };
    }

    private async createDocumentRecord(context: ExtractEditalData.ExecutionContext): Promise<void> {
        const storedDocument = this.getStoredDocument(context);

        await this.documentRepository.create({
            id: context.documentId,
            companyId: context.companyId,
            createdById: context.input.createdById,
            type: DocumentType.EDITAL,
            originalName: context.originalFilename,
            mimeType: context.mimeType,
            sizeBytes: context.documentSizeBytes,
            storageProvider: "cloudflare_r2",
            storageBucket: storedDocument.bucket,
            storageKey: storedDocument.storageKey,
            storageUrl: storedDocument.url ?? `${storedDocument.bucket}/${storedDocument.storageKey}`,
            vectorDocumentId: context.documentId,
            vectorCollectionName: this.vectorStoreConfig.COLLECTION_NAME,
            status: DocumentStatus.PROCESSING,
        });

        context.documentCreated = true;
    }

    private getStoredDocument(context: ExtractEditalData.ExecutionContext) {
        if (!context.storedDocument) {
            throw new Error("Documento ainda não foi armazenado no object storage.");
        }

        return context.storedDocument;
    }

    private async createAnalysisRecord(context: ExtractEditalData.ExecutionContext): Promise<void> {
        const analysis = await this.documentAnalysisRepository.create({
            documentId: context.documentId,
            companyId: context.companyId,
            createdById: context.input.createdById,
            type: DocumentAnalysisType.EXTRACT_EDITAL,
            status: DocumentAnalysisStatus.RUNNING,
            startedAt: new Date(),
        });

        context.analysisId = analysis.id;
    }

    private async runExtractionPipelines(
        context: ExtractEditalData.ExecutionContext,
    ): Promise<ExtractEditalData.PipelineExecutionResult> {
        console.log(`[ExtractEditalData] Iniciando pipelines em paralelo — documentId: ${context.documentId}`);

        const pipelinesStartedAt = performance.now();
        const [infoResult, itemsResult] = await Promise.all([
            this.startInfoPipeline(context),
            this.startItemsPipeline(context),
        ]);

        return {
            infoResult,
            itemsResult,
            pipelinesTimeMs: performance.now() - pipelinesStartedAt,
        };
    }

    private async startInfoPipeline(
        context: ExtractEditalData.ExecutionContext,
    ): Promise<ExtractInfoPipelineResult> {
        const result = await this.infoPipeline.execute({
            pdfBuffer: context.input.pdfBuffer,
            documentId: context.documentId,
            tracker: context.tracker,
            config: this.vectorStoreConfig,
        });

        context.latestInfoResult = result;
        await this.emitInfoPartial(context, result);

        return result;
    }

    private async emitInfoPartial(
        context: ExtractEditalData.ExecutionContext,
        result: ExtractInfoPipelineResult,
    ): Promise<void> {
        await context.input.onInfoPartial?.({
            type: "partial_info",
            scope: "info",
            step: "info.partial",
            message: "Extração de informações concluída",
            percent: 70,
            pipelinePercent: 100,
            partialItemsCount: context.partialItems.length,
            result: this.buildPartialOutput(context.sessionId, result, context.partialItems),
        });
    }

    private async startItemsPipeline(
        context: ExtractEditalData.ExecutionContext,
    ): Promise<ExtractItemsPipelineResult> {
        return this.itemsPipeline.execute({
            pdfBuffer: context.input.pdfBuffer,
            documentId: context.documentId,
            tracker: context.tracker,
            config: this.vectorStoreConfig,
            onBatchCompleted: batch => this.emitItemsBatchPartial(context, batch),
        });
    }

    private async emitItemsBatchPartial(
        context: ExtractEditalData.ExecutionContext,
        batch: ExtractItemsPipeline.BatchCompletedEvent,
    ): Promise<void> {
        context.partialItems = batch.cumulativeItems;

        const batchItems = this.mapPartialItems(batch.batchItems);
        const cumulativeItems = this.mapPartialItems(batch.cumulativeItems);

        await context.input.onItemsBatchPartial?.({
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
            result: this.buildPartialOutput(context.sessionId, context.latestInfoResult, batch.cumulativeItems),
        });
    }

    private async buildFinalOutput(
        context: ExtractEditalData.ExecutionContext,
        pipelineResults: ExtractEditalData.PipelineExecutionResult,
    ): Promise<ExtractEditalData.Output> {
        const { infoResult, itemsResult, pipelinesTimeMs } = pipelineResults;

        context.tracker.emitMap();
        const mapStartedAt = performance.now();
        const licitacao = EditalExtractionMapper.toLicitacao(infoResult.extraction, itemsResult.itens);
        const mapTimeMs = performance.now() - mapStartedAt;

        const mdContent = this.buildMarkdownContent(infoResult, itemsResult);

        context.tracker.emitSave(context.documentId);
        const saveStartedAt = performance.now();
        const saveTimeMs = performance.now() - saveStartedAt;
        const totalTimeMs = context.tracker.finishTotal({ sessionId: context.sessionId });

        const metrics = this.buildMetrics({
            context,
            infoResult,
            itemsResult,
            pipelinesTimeMs,
            mapTimeMs,
            saveTimeMs,
            totalTimeMs,
        });

        return {
            sessionId: context.sessionId,
            mdContent,
            licitacao,
            metrics,
        };
    }

    private buildMarkdownContent(
        info: ExtractInfoPipelineResult,
        items: ExtractItemsPipelineResult,
    ): string {
        return `${info.ingestionResult.prettifiedRaw || ""}\n\n${items.ingestionResult.prettifiedRaw || ""}`;
    }

    private buildMetrics(params: {
        context: ExtractEditalData.ExecutionContext;
        infoResult: ExtractInfoPipelineResult;
        itemsResult: ExtractItemsPipelineResult;
        pipelinesTimeMs: number;
        mapTimeMs: number;
        saveTimeMs: number;
        totalTimeMs: number;
    }): ExtractEditalDataControllerSchemas.Metrics {
        const {
            context,
            infoResult,
            itemsResult,
            pipelinesTimeMs,
            mapTimeMs,
            saveTimeMs,
            totalTimeMs,
        } = params;

        const totalAgentTokens = this.buildTotalAgentTokens(infoResult, itemsResult);
        const embeddingTokensUsed = this.buildEmbeddingTokensUsed(infoResult, itemsResult);
        const infoPreparationTimeMs = Math.max(infoResult.ingestionResult.totalTimeMs, infoResult.metrics.prepareQueries.totalTimeMs);
        const itemsPreparationTimeMs = Math.max(itemsResult.ingestionResult.totalTimeMs, itemsResult.metrics.prepareQueries.totalTimeMs);

        return {
            sessionId: context.sessionId,
            timestamp: new Date().toISOString(),
            pdfFilename: context.input.pdfFilename ?? context.documentId,
            pdfFileSizeBytes: context.input.pdfBuffer.byteLength,
            totalWords: infoResult.ingestionResult.totalWords,
            entriesIndexed: infoResult.ingestionResult.entriesCount + itemsResult.ingestionResult.entriesCount,
            itemsExtracted: itemsResult.itens.length,
            totalTimeMs,
            tokensUsed: totalAgentTokens,
            embeddingTokensUsed,
            chunksEnviados: {
                agenteCampos: infoResult.infoChunks.payloads.length,
                agenteItens: itemsResult.itemChunks.payloads.length,
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
                                this.buildMetricDetail("Pipeline de campos", this.formatMs(infoResult.metrics.totalTimeMs)),
                                this.buildMetricDetail("Pipeline de itens", this.formatMs(itemsResult.metrics.totalTimeMs)),
                                this.buildMetricDetail("Ganho do paralelismo", this.formatMs(Math.max(0, infoResult.metrics.totalTimeMs + itemsResult.metrics.totalTimeMs - pipelinesTimeMs))),
                            ],
                        },
                        {
                            id: "map_result",
                            label: "Mapear resultado final",
                            timeMs: mapTimeMs,
                            details: [
                                this.buildMetricDetail("Itens consolidados", itemsResult.itens.length.toLocaleString("pt-BR")),
                            ],
                        },
                    ],
                },
                info: {
                    label: "Pipeline de campos",
                    totalTimeMs: infoResult.metrics.totalTimeMs,
                    steps: [
                        {
                            id: "prepare_pipeline",
                            label: "Preparar pipeline de campos",
                            timeMs: infoPreparationTimeMs,
                            details: [
                                this.buildMetricDetail("PDF -> chunks", this.formatMs(infoResult.ingestionResult.parseTimeMs)),
                                this.buildMetricDetail("Embedding", this.formatMs(infoResult.ingestionResult.embeddingTimeMs)),
                                this.buildMetricDetail("Indexação", this.formatMs(infoResult.ingestionResult.indexingTimeMs)),
                                this.buildMetricDetail("Queries", this.formatMs(infoResult.metrics.prepareQueries.totalTimeMs)),
                                this.buildMetricDetail("Chunks indexados", infoResult.ingestionResult.entriesCount.toLocaleString("pt-BR")),
                                this.buildMetricDetail("Consultas", infoResult.metrics.prepareQueries.queryCount.toLocaleString("pt-BR")),
                            ],
                        },
                        {
                            id: "search_chunks",
                            label: "Buscar chunks para campos",
                            timeMs: infoResult.metrics.search.totalTimeMs,
                            details: [
                                this.buildMetricDetail("Chunks selecionados", infoResult.metrics.search.selectedHits.toLocaleString("pt-BR")),
                                this.buildMetricDetail("Chunks únicos", infoResult.metrics.search.uniqueHits.toLocaleString("pt-BR")),
                            ],
                        },
                        {
                            id: "extract_fields",
                            label: "Extrair campos com IA",
                            timeMs: infoResult.metrics.extraction.totalTimeMs,
                            details: [
                                this.buildMetricDetail("Chunks enviados", infoResult.metrics.extraction.payloadCount.toLocaleString("pt-BR")),
                                this.buildMetricDetail("Tokens de IA", infoResult.metrics.extraction.totalTokens.toLocaleString("pt-BR")),
                            ],
                        },
                    ],
                },
                items: {
                    label: "Pipeline de itens",
                    totalTimeMs: itemsResult.metrics.totalTimeMs,
                    steps: [
                        {
                            id: "prepare_pipeline",
                            label: "Preparar pipeline de itens",
                            timeMs: itemsPreparationTimeMs,
                            details: [
                                this.buildMetricDetail("PDF -> linhas", this.formatMs(itemsResult.ingestionResult.parseTimeMs)),
                                this.buildMetricDetail("Embedding", this.formatMs(itemsResult.ingestionResult.embeddingTimeMs)),
                                this.buildMetricDetail("Indexação", this.formatMs(itemsResult.ingestionResult.indexingTimeMs)),
                                this.buildMetricDetail("Queries", this.formatMs(itemsResult.metrics.prepareQueries.totalTimeMs)),
                                this.buildMetricDetail("Linhas indexadas", itemsResult.ingestionResult.entriesCount.toLocaleString("pt-BR")),
                                this.buildMetricDetail("Consultas", itemsResult.metrics.prepareQueries.queryCount.toLocaleString("pt-BR")),
                            ],
                        },
                        {
                            id: "search_chunks",
                            label: "Buscar linhas para itens",
                            timeMs: itemsResult.metrics.search.totalTimeMs,
                            details: [
                                this.buildMetricDetail("Linhas selecionadas", itemsResult.metrics.search.selectedHits.toLocaleString("pt-BR")),
                                this.buildMetricDetail("Linhas válidas", itemsResult.metrics.search.filteredHits.toLocaleString("pt-BR")),
                            ],
                        },
                        {
                            id: "build_batches",
                            label: "Montar lotes para IA",
                            timeMs: itemsResult.metrics.batching.totalTimeMs,
                            details: [
                                this.buildMetricDetail("Lotes", itemsResult.metrics.batching.batchCount.toLocaleString("pt-BR")),
                                this.buildMetricDetail("Carga total", `${Math.round(itemsResult.metrics.batching.totalPayloadChars / 1024)} KB`),
                            ],
                        },
                        {
                            id: "extract_items",
                            label: "Extrair itens com IA",
                            timeMs: itemsResult.metrics.extraction.totalTimeMs,
                            details: [
                                this.buildMetricDetail("Chunks enviados", itemsResult.metrics.extraction.payloadCount.toLocaleString("pt-BR")),
                                this.buildMetricDetail("Itens extraídos", itemsResult.metrics.extraction.uniqueItemsCount.toLocaleString("pt-BR")),
                                this.buildMetricDetail("Tokens de IA", itemsResult.metrics.extraction.totalTokens.toLocaleString("pt-BR")),
                            ],
                        },
                    ],
                },
            },
        };
    }

    private buildTotalAgentTokens(
        info: ExtractInfoPipelineResult,
        items: ExtractItemsPipelineResult,
    ) {
        return {
            prompt: info.tokensUsed.prompt + items.tokensUsed.prompt + info.prettifyMetrics.prompt + items.prettifyMetrics.prompt,
            completion: info.tokensUsed.completion + items.tokensUsed.completion + info.prettifyMetrics.completion + items.prettifyMetrics.completion,
            total: info.tokensUsed.total + items.tokensUsed.total + info.prettifyMetrics.total + items.prettifyMetrics.total,
        };
    }

    private buildEmbeddingTokensUsed(
        info: ExtractInfoPipelineResult,
        items: ExtractItemsPipelineResult,
    ): number {
        return (
            info.ingestionResult.embeddingTokensUsed +
            items.ingestionResult.embeddingTokensUsed +
            info.metrics.prepareQueries.embeddingTokensUsed +
            items.metrics.prepareQueries.embeddingTokensUsed
        );
    }

    private buildMetricDetail(label: string, value: string | number) {
        return { label, value: String(value) };
    }

    private async markDocumentAsReady(context: ExtractEditalData.ExecutionContext): Promise<void> {
        await this.documentRepository.update({
            id: context.documentId,
            data: { status: DocumentStatus.READY },
        });
    }

    private async markAnalysisAsCompleted(
        context: ExtractEditalData.ExecutionContext,
        output: ExtractEditalData.Output,
    ): Promise<void> {
        if (!context.analysisId) {
            return;
        }

        await this.documentAnalysisRepository.update({
            id: context.analysisId,
            data: {
                status: DocumentAnalysisStatus.COMPLETED,
                result: this.buildAnalysisResult(output),
                metrics: output.metrics as Prisma.InputJsonValue,
                finishedAt: new Date(),
            },
        });
    }

    private buildAnalysisResult(output: ExtractEditalData.Output): Prisma.InputJsonValue {
        return {
            sessionId: output.sessionId,
            licitacao: output.licitacao,
        } as Prisma.InputJsonValue;
    }

    private async handleExecutionFailure(
        context: ExtractEditalData.ExecutionContext,
        error: unknown,
    ): Promise<void> {
        await this.rollbackStoredDocumentIfNeeded(context);
        await this.markDocumentAsFailedIfNeeded(context);
        await this.markAnalysisAsFailedIfNeeded(context, error);
    }

    private async rollbackStoredDocumentIfNeeded(context: ExtractEditalData.ExecutionContext): Promise<void> {
        if (context.documentCreated) {
            return;
        }

        await this.objectStorageProvider.deleteDocument({
            key: context.logicalStorageKey,
        }).catch(() => undefined);
    }

    private async markDocumentAsFailedIfNeeded(context: ExtractEditalData.ExecutionContext): Promise<void> {
        if (!context.documentCreated) {
            return;
        }

        await this.documentRepository.update({
            id: context.documentId,
            data: { status: DocumentStatus.FAILED },
        }).catch(() => undefined);
    }

    private async markAnalysisAsFailedIfNeeded(
        context: ExtractEditalData.ExecutionContext,
        error: unknown,
    ): Promise<void> {
        if (!context.analysisId) {
            return;
        }

        await this.documentAnalysisRepository.update({
            id: context.analysisId,
            data: {
                status: DocumentAnalysisStatus.FAILED,
                errorMessage: error instanceof Error ? error.message : "Erro inesperado durante a análise.",
                finishedAt: new Date(),
            },
        }).catch(() => undefined);
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

    private buildStorageKey(companyId: string, documentId: string): string {
        return `companies/${companyId}/documents/${documentId}/original.pdf`;
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
        pdfFilename?: string;
        pdfMimeType?: string;
        pdfFileSizeBytes?: number;
        companyId: string;
        userId: string;
        createdById?: string;
        externalId?: string;
        onProgress?: (event: ProgressEvent) => void;
        onInfoPartial?: (event: InfoPartialEvent) => void | Promise<void>;
        onItemsBatchPartial?: (event: ItemsBatchPartialEvent) => void | Promise<void>;
    }

    export type Output = ExtractEditalDataControllerSchemas.Output;

    export type ExecutionContext = {
        input: Input;
        companyId: string;
        documentId: string;
        sessionId: string;
        tracker: ExtractEditalTracker;
        originalFilename: string;
        mimeType: string;
        documentSizeBytes: number;
        logicalStorageKey: string;
        storedDocument: IObjectStorageProvider.PutDocumentResponse | null;
        documentCreated: boolean;
        analysisId: string | null;
        latestInfoResult: ExtractInfoPipelineResult | null;
        partialItems: any[];
    };

    export type PipelineExecutionResult = {
        infoResult: ExtractInfoPipelineResult;
        itemsResult: ExtractItemsPipelineResult;
        pipelinesTimeMs: number;
    };
}
