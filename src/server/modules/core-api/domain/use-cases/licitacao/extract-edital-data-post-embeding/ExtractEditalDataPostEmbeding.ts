import { DocumentAnalysisStatus, DocumentAnalysisType, DocumentStatus, DocumentType, Prisma } from "@prisma/client";
import { performance } from "perf_hooks";
import type { ExtractEditalData } from "../extract-edital-data/ExtractEditalData";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentAnalysisRepository } from "@/server/shared/infra/repositories/document-analysis.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import type { MetricsProvider } from "@/server/shared/infra/providers/metrics/metrics-provider";
import type { ExtractionSessionProvider } from "@/server/shared/infra/providers/session/extraction-session-provider";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import { EditalExtractionMapper } from "../extract-edital-data/dtos/EditalExtractionMapper";
import type { ExtractInfoPipelineResult } from "../extract-edital-data/pipelines/ExtractInfoPipeline";
import { ExtractInfoPipeline } from "../extract-edital-data/pipelines/ExtractInfoPipeline";
import type { ExtractItemsPipelineResult } from "../extract-edital-data/pipelines/ExtractItemsPipeline";
import { ExtractItemsPipeline } from "../extract-edital-data/pipelines/ExtractItemsPipeline";
import { ExtractEditalTracker } from "../extract-edital-data/utils/ExtractEditalTracker";
import { ExtractEditalDataPostEmbedingControllerSchemas } from "./ExtractEditalDataPostEmbedingControllerSchemas";
import { RecoverPreprocessedEditalDocument } from "./utils/RecoverPreprocessedEditalDocument";

export class ExtractEditalDataPostEmbeding {
    constructor(
        private readonly infoPipeline: ExtractInfoPipeline,
        private readonly itemsPipeline: ExtractItemsPipeline,
        private readonly sessionStorage: ExtractionSessionProvider,
        private readonly metricsProvider: MetricsProvider.Contract,
        private readonly vectorStoreConfig: ExtractEditalData.VectorStoreConfig,
        private readonly documentRepository: PrismaDocumentRepository,
        private readonly documentAnalysisRepository: PrismaDocumentAnalysisRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
        private readonly recoverPreprocessedEditalDocument: RecoverPreprocessedEditalDocument,
    ) { }

    async execute(input: ExtractEditalDataPostEmbeding.Input): Promise<ExtractEditalDataPostEmbeding.Output> {
        const companyId = await this.authorizeCompanyAccess(input);
        const document = await this.loadDocument(input.documentId, companyId);
        const context = this.createExecutionContext(input, companyId, document);

        try {
            await this.createAnalysisRecord(context);
            const preprocessedDocument = await this.recoverPreprocessedEditalDocument.execute({
                documentId: context.vectorDocumentId,
                collectionName: context.vectorCollectionName,
                originalFilename: context.document.originalName,
            });

            const pipelineResults = await this.runExtractionPipelines(context, preprocessedDocument);
            const output = await this.buildFinalOutput(context, pipelineResults);

            await this.markAnalysisAsCompleted(context, output);
            return output;
        } catch (error) {
            await this.markAnalysisAsFailedIfNeeded(context, error);
            throw error;
        }
    }

    private async authorizeCompanyAccess(input: ExtractEditalDataPostEmbeding.Input): Promise<string> {
        const company = await assertUserCanAccessCompany({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: input.userId,
            companyId: input.companyId,
        });

        return company.id;
    }

    private async loadDocument(documentId: string, companyId: string) {
        const document = await this.documentRepository.findById({ id: documentId });

        if (!document) {
            throw new Error("Documento pré-processado não encontrado.");
        }

        if (document.companyId !== companyId) {
            throw new Error("O documento informado não pertence à empresa selecionada.");
        }

        if (document.type !== DocumentType.EDITAL) {
            throw new Error("A extração pós-embedding só pode ser executada para documentos do tipo edital.");
        }

        if (document.status !== DocumentStatus.READY) {
            throw new Error("O documento ainda não está pronto para a extração pós-embedding.");
        }

        if (!document.vectorDocumentId || !document.vectorCollectionName) {
            throw new Error("O documento não possui metadados vetoriais suficientes para a extração pós-embedding.");
        }

        return document;
    }

    private createExecutionContext(
        input: ExtractEditalDataPostEmbeding.Input,
        companyId: string,
        document: PrismaDocumentRepository.DocumentResponse,
    ): ExtractEditalDataPostEmbeding.ExecutionContext {
        return {
            input,
            companyId,
            document,
            vectorDocumentId: document.vectorDocumentId,
            vectorCollectionName: document.vectorCollectionName,
            sessionId: this.sessionStorage.newSessionId(),
            tracker: new ExtractEditalTracker(this.metricsProvider, input.onProgress ?? (() => { })),
            analysisId: null,
            latestInfoResult: null,
            partialItems: [],
        };
    }

    private async createAnalysisRecord(context: ExtractEditalDataPostEmbeding.ExecutionContext): Promise<void> {
        const analysis = await this.documentAnalysisRepository.create({
            documentId: context.document.id,
            companyId: context.companyId,
            createdById: context.input.createdById,
            type: DocumentAnalysisType.EXTRACT_EDITAL,
            status: DocumentAnalysisStatus.RUNNING,
            startedAt: new Date(),
        });

        context.analysisId = analysis.id;
    }

    private async runExtractionPipelines(
        context: ExtractEditalDataPostEmbeding.ExecutionContext,
        preprocessedDocument: RecoverPreprocessedEditalDocument.Output,
    ): Promise<ExtractEditalDataPostEmbeding.PipelineExecutionResult> {
        console.log(`[ExtractEditalDataPostEmbeding] Iniciando pipelines em paralelo — vectorDocumentId: ${context.vectorDocumentId}`);

        const pipelinesStartedAt = performance.now();
        const [infoResult, itemsResult] = await Promise.all([
            this.startInfoPipeline(context, preprocessedDocument),
            this.startItemsPipeline(context, preprocessedDocument),
        ]);

        return {
            infoResult,
            itemsResult,
            pipelinesTimeMs: performance.now() - pipelinesStartedAt,
        };
    }

    private async startInfoPipeline(
        context: ExtractEditalDataPostEmbeding.ExecutionContext,
        preprocessedDocument: RecoverPreprocessedEditalDocument.Output,
    ): Promise<ExtractInfoPipelineResult> {
        const result = await this.infoPipeline.execute({
            documentId: context.vectorDocumentId,
            collectionName: context.vectorCollectionName,
            tracker: context.tracker,
            config: this.vectorStoreConfig,
            preprocessedIngestionResult: preprocessedDocument.infoIngestionResult,
        });

        context.latestInfoResult = result;
        await this.emitInfoPartial(context, result);

        return result;
    }

    private async emitInfoPartial(
        context: ExtractEditalDataPostEmbeding.ExecutionContext,
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
        context: ExtractEditalDataPostEmbeding.ExecutionContext,
        preprocessedDocument: RecoverPreprocessedEditalDocument.Output,
    ): Promise<ExtractItemsPipelineResult> {
        return this.itemsPipeline.execute({
            documentId: context.vectorDocumentId,
            collectionName: context.vectorCollectionName,
            tracker: context.tracker,
            config: this.vectorStoreConfig,
            preprocessedIngestionResult: preprocessedDocument.itemsIngestionResult,
            onBatchCompleted: batch => this.emitItemsBatchPartial(context, batch),
        });
    }

    private async emitItemsBatchPartial(
        context: ExtractEditalDataPostEmbeding.ExecutionContext,
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
        context: ExtractEditalDataPostEmbeding.ExecutionContext,
        pipelineResults: ExtractEditalDataPostEmbeding.PipelineExecutionResult,
    ): Promise<ExtractEditalDataPostEmbeding.Output> {
        const { infoResult, itemsResult, pipelinesTimeMs } = pipelineResults;

        context.tracker.emitMap();
        const mapStartedAt = performance.now();
        const licitacao = EditalExtractionMapper.toLicitacao(infoResult.extraction, itemsResult.itens);
        const mapTimeMs = performance.now() - mapStartedAt;

        const mdContent = this.buildMarkdownContent(infoResult, itemsResult);

        context.tracker.emitSave(context.document.id);
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
        return `${info.ingestionResult.prettifiedRaw || ""}\n\n${items.ingestionResult.prettifiedRaw || ""}`.trim();
    }

    private buildMetrics(params: {
        context: ExtractEditalDataPostEmbeding.ExecutionContext;
        infoResult: ExtractInfoPipelineResult;
        itemsResult: ExtractItemsPipelineResult;
        pipelinesTimeMs: number;
        mapTimeMs: number;
        saveTimeMs: number;
        totalTimeMs: number;
    }): ExtractEditalDataPostEmbedingControllerSchemas.Metrics {
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

        return {
            sessionId: context.sessionId,
            timestamp: new Date().toISOString(),
            pdfFilename: context.document.originalName,
            pdfFileSizeBytes: context.document.sizeBytes,
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
                metrics: "",
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
                                this.buildMetricDetail("Documento reutilizado", context.document.id),
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
                            id: "reuse_preprocessed_document",
                            label: "Reutilizar índice vetorial de campos",
                            timeMs: infoResult.ingestionResult.totalTimeMs,
                            details: [
                                this.buildMetricDetail("Chunks reutilizados", infoResult.ingestionResult.entriesCount.toLocaleString("pt-BR")),
                                this.buildMetricDetail("Tempo de reprocessamento do PDF", this.formatMs(infoResult.ingestionResult.totalTimeMs)),
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
                            id: "reuse_preprocessed_document",
                            label: "Reutilizar índice vetorial de itens",
                            timeMs: itemsResult.ingestionResult.totalTimeMs,
                            details: [
                                this.buildMetricDetail("Linhas reutilizadas", itemsResult.ingestionResult.entriesCount.toLocaleString("pt-BR")),
                                this.buildMetricDetail("Tempo de reprocessamento do PDF", this.formatMs(itemsResult.ingestionResult.totalTimeMs)),
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

    private async markAnalysisAsCompleted(
        context: ExtractEditalDataPostEmbeding.ExecutionContext,
        output: ExtractEditalDataPostEmbeding.Output,
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

    private buildAnalysisResult(output: ExtractEditalDataPostEmbeding.Output): Prisma.InputJsonValue {
        return {
            sessionId: output.sessionId,
            licitacao: output.licitacao,
        } as Prisma.InputJsonValue;
    }

    private async markAnalysisAsFailedIfNeeded(
        context: ExtractEditalDataPostEmbeding.ExecutionContext,
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
    ): ExtractEditalDataPostEmbeding.PartialOutput {
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

export namespace ExtractEditalDataPostEmbeding {
    export type ProgressEvent = ExtractEditalData.ProgressEvent;
    export type InfoPartialEvent = ExtractEditalData.InfoPartialEvent;
    export type ItemsBatchPartialEvent = ExtractEditalData.ItemsBatchPartialEvent;
    export type VectorStoreConfig = ExtractEditalData.VectorStoreConfig;

    export interface Input {
        documentId: string;
        companyId: string;
        userId: string;
        createdById?: string;
        externalId?: string;
        onProgress?: (event: ProgressEvent) => void;
        onInfoPartial?: (event: InfoPartialEvent) => void | Promise<void>;
        onItemsBatchPartial?: (event: ItemsBatchPartialEvent) => void | Promise<void>;
    }

    export type Output = ExtractEditalDataPostEmbedingControllerSchemas.Output;
    export type PartialOutput = Pick<Output, "sessionId" | "mdContent" | "licitacao">;

    export type ExecutionContext = {
        input: Input;
        companyId: string;
        document: PrismaDocumentRepository.DocumentResponse;
        vectorDocumentId: string;
        vectorCollectionName: string;
        sessionId: string;
        tracker: ExtractEditalTracker;
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
