/* eslint-disable @typescript-eslint/no-namespace */
import type { IEmbeddingProvider } from "@/server/modules/core-api/domain/data/IEmbeddingProvider";
import type { IVectorStore } from "@/server/modules/core-api/domain/data/IVectorStore";
import type { DocumentHandlerFileParsingProvider } from "@/server/shared/infra/providers/pdf/document-handler-file-parsing-provider";
import type { ProcessPdfResponse } from "@/server/shared/lib/document-handler/generated/models/ProcessPdfResponse";
import type { IIdentifierProvider } from "@/server/modules/core-api/domain/data/IIdentifierProvider";
import type { IPromiseProvider } from "@/server/modules/core-api/domain/data/IPromiseProvider";
import type { MetricsProvider } from "@/server/shared/infra/providers/metrics/metrics-provider";
import type { ProcessedChunk } from "@/server/modules/core-api/domain/data/ProcessedChunk";
import { performance } from "perf_hooks";
import { buildDocumentChunkPayload } from "./build-document-chunk-payload";

type RawDocumentChunk = Record<string, unknown> & {
    content: string;
    embedInput: string;
    raw?: string;
    header?: string;
    metadata?: Record<string, unknown> & {
        base?: {
            type?: string;
            page?: number;
            origin?: string;
            section?: string;
            level?: number;
        };
    };
};

type EmbeddedDocumentEntry = {
    entry: {
        id: string;
        embedInput: string;
        original: RawDocumentChunk;
    };
    embedding: Float32Array;
};

function serializeError(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: error.cause,
        };
    }

    return { message: String(error) };
}

function logPdfIngestion(traceId: string | undefined, message: string, data?: Record<string, unknown>) {
    console.info(`[PdfIngestionWorker:${traceId ?? "no-trace"}] ${message}`, data ?? {});
}

function logPdfIngestionError(traceId: string | undefined, message: string, error: unknown, data?: Record<string, unknown>) {
    console.error(`[PdfIngestionWorker:${traceId ?? "no-trace"}] ${message}`, {
        ...data,
        ...serializeError(error),
    });
}

export class PdfIngestionWorker {
    private readonly MIN_EMBEDDING_BATCH_SIZE = 100;
    private readonly STORAGE_UPSERT_BATCH_SIZE = 200;
    private readonly MIN_STORAGE_BATCH_SIZE = this.STORAGE_UPSERT_BATCH_SIZE;

    constructor(
        private readonly documentParser: DocumentHandlerFileParsingProvider.Contract,
        private readonly embeddingProvider: IEmbeddingProvider,
        private readonly vectorStore: IVectorStore.Contract,
        private readonly identifierProvider: IIdentifierProvider,
        private readonly promiseProvider: IPromiseProvider,
        private readonly metrics: MetricsProvider.Contract,
        private readonly config: PdfIngestionWorker.Config,
    ) { }

    async ingest(documentId: string, {
        pdfBuffer,
        parsedResponse,
        embeddingConcurrency = 1,
        storeConcurrency = 1,
        onProgress,
        traceId,
    }: PdfIngestionWorker.Input): Promise<PdfIngestionWorker.Result> {
        const ingestStartedAt = performance.now();

        logPdfIngestion(traceId, "ingest.started", {
            documentId,
            bytes: pdfBuffer.byteLength,
            hasParsedResponse: Boolean(parsedResponse),
            embeddingConcurrency,
            storeConcurrency,
        });

        logPdfIngestion(traceId, "collection.ensure.started", {
            documentId,
            collectionName: this.config.collectionName,
        });
        const ensureCollectionTimeMs = await this.stepEnsureVectorCollectionExists();
        logPdfIngestion(traceId, "collection.ensure.done", {
            documentId,
            durationMs: ensureCollectionTimeMs,
        });

        let response: ProcessPdfResponse;
        let parseTimeMs = 0;

        try {
            logPdfIngestion(traceId, "parse.started", {
                documentId,
                bytes: pdfBuffer.byteLength,
            });
            const parsed = await this.stepParseDocument(pdfBuffer, documentId, parsedResponse);
            response = parsed.response;
            parseTimeMs = parsed.timeMs;
            logPdfIngestion(traceId, "parse.done", {
                documentId,
                durationMs: parseTimeMs,
                providerReportedParseTimeMs: response.processing_time_ms,
                sections: response.sections.length,
                tables: response.tables.length,
                totalChars: response.total_chars,
                totalWords: response.total_words,
            });
        } catch (error) {
            logPdfIngestionError(traceId, "parse.failed", error, {
                documentId,
                elapsedMs: performance.now() - ingestStartedAt,
            });
            throw error;
        }

        const allChunks = this.stepExtractRawChunksFromResponse(response);
        logPdfIngestion(traceId, "chunks.extracted", {
            documentId,
            chunks: allChunks.length,
        });
        onProgress?.onParsed(parseTimeMs);

        if (allChunks.length === 0) {
            logPdfIngestion(traceId, "ingest.empty", {
                documentId,
                elapsedMs: performance.now() - ingestStartedAt,
            });
            return this.stepReturnEmptyResult(documentId, response, {
                ensureCollectionTimeMs,
                parseTimeMs,
                totalTimeMs: performance.now() - ingestStartedAt,
            });
        }

        // Decisão de concorrência para Embeddings
        const targetEmbeddingConcurrency = this.calculateTargetConcurrency(allChunks.length, embeddingConcurrency, this.MIN_EMBEDDING_BATCH_SIZE);
        const hasEmbeddingConcurrency = targetEmbeddingConcurrency > 1;

        logPdfIngestion(traceId, "embeddings.started", {
            documentId,
            chunks: allChunks.length,
            targetEmbeddingConcurrency,
        });
        const { embeddedEntries, embeddingTokensUsed, timeMs: embeddingTimeMs } = hasEmbeddingConcurrency
            ? await this.stepGenerateEmbeddingsForChunksWithConcurrency(allChunks, targetEmbeddingConcurrency, onProgress)
            : await this.stepGenerateEmbeddingsForChunks(allChunks, onProgress);
        logPdfIngestion(traceId, "embeddings.done", {
            documentId,
            embeddedEntries: embeddedEntries.length,
            embeddingTokensUsed,
            durationMs: embeddingTimeMs,
        });

        // Decisão de concorrência para Storage
        const targetStoreConcurrency = this.calculateTargetConcurrency(embeddedEntries.length, storeConcurrency, this.MIN_STORAGE_BATCH_SIZE);
        const hasStoreConcurrency = targetStoreConcurrency > 1;

        logPdfIngestion(traceId, "vector.upsert.started", {
            documentId,
            points: embeddedEntries.length,
            targetStoreConcurrency,
        });
        const indexingTimeMs = hasStoreConcurrency
            ? await this.stepSavePointsToVectorStoreWithConcurrency(documentId, embeddedEntries, targetStoreConcurrency, onProgress)
            : await this.stepSavePointsToVectorStore(documentId, embeddedEntries, onProgress);
        logPdfIngestion(traceId, "vector.upsert.done", {
            documentId,
            points: embeddedEntries.length,
            durationMs: indexingTimeMs,
        });

        // Mapear para ProcessedChunk garantindo que as propriedades obrigatórias do metadados existam
        const entries: ProcessedChunk[] = allChunks.map((c, i) => {
            const baseType = c.metadata?.base?.type === "table_row" ? "table_row" : "text";

            return {
                id: this.identifierProvider.generate(),
                embedInput: c.embedInput,
                content: c.content,
                raw: c.raw ?? c.content,
                metadata: {
                    ...c.metadata,
                    type: baseType,
                    page: c.metadata?.base?.page ?? 0,
                    origin: c.metadata?.base?.origin ?? documentId,
                    chunk_index: i,
                    word_count: c.content.split(/\s+/).length,
                }
            };
        });

        const totalTimeMs = performance.now() - ingestStartedAt;
        logPdfIngestion(traceId, "ingest.done", {
            documentId,
            entriesCount: allChunks.length,
            totalTimeMs,
        });

        return {
            documentId,
            ensureCollectionTimeMs,
            parseTimeMs,
            providerReportedParseTimeMs: response.processing_time_ms,
            embeddingTimeMs,
            indexingTimeMs,
            totalTimeMs,
            embeddingTokensUsed,
            entriesCount: allChunks.length,
            totalChars: response.total_chars,
            totalWords: response.total_words,
            raw: allChunks.map(c => c.content).join("\n\n"),
            entries,
        };
    }

    private async stepEnsureVectorCollectionExists(): Promise<number> {
        const stopTimer = this.metrics.startTimer("pdf-ingestion:ensure-collection");
        await this.vectorStore.ensureCollection(this.config.collectionName, {
            vectorSize: this.embeddingProvider.dimensions,
            payloadIndexFields: ["document_id", "documentId", "metadata.base.type", "metadata.base.page", "page", "heading"],
        });
        return stopTimer({ collectionName: this.config.collectionName });
    }

    private async stepParseDocument(
        buffer: Buffer,
        documentId: string,
        parsedResponse?: ProcessPdfResponse,
    ): Promise<{ response: ProcessPdfResponse; timeMs: number }> {
        if (parsedResponse) {
            return {
                response: parsedResponse,
                timeMs: parsedResponse.processing_time_ms,
            };
        }

        const stopTimer = this.metrics.startTimer("pdf-ingestion:parse-document");
        const response = await this.documentParser.process(buffer, documentId);
        const timeMs = stopTimer({ documentId, providerReportedParseTimeMs: response.processing_time_ms });
        return { response, timeMs };
    }

    private stepExtractRawChunksFromResponse(response: ProcessPdfResponse): RawDocumentChunk[] {
        const chunks: RawDocumentChunk[] = [];

        response.sections.forEach(section => {
            section.chunks.forEach(chunk => {
                chunks.push({
                    ...chunk,
                    content: chunk.text,
                    embedInput: chunk.header ? `${chunk.header}\n\n${chunk.text}` : chunk.text,
                    metadata: {
                        ...chunk.metadata,
                        base: {
                            type: "text",
                            page: section.page_start,
                            origin: response.filename,
                            section: section.header,
                            level: section.level,
                        }
                    }
                });
            });
        });

        response.tables.forEach(table => {
            table.chunks.forEach(chunk => {
                const rowContent = Object.values(chunk.data as Record<string, unknown>).join(" | ");
                chunks.push({
                    ...chunk,
                    content: rowContent,
                    embedInput: `Tabela (pág ${table.page}): ${rowContent}`,
                    raw: table.markdown,
                    metadata: {
                        base: {
                            type: "table_row",
                            page: table.page,
                            origin: response.filename,
                        }
                    }
                });
            });
        });

        return chunks;
    }

    private async stepGenerateEmbeddingsForChunks(chunks: RawDocumentChunk[], onProgress?: PdfIngestionWorker.IngestionProgress) {
        const stopTimer = this.metrics.startTimer("pdf-ingestion:generate-embeddings");

        const { results: embeddedEntries, tokensUsed: embeddingTokensUsed } = await this.embeddingProvider.embedMany(
            chunks.map(c => ({ id: this.identifierProvider.generate(), embedInput: c.embedInput, original: c }))
        );

        onProgress?.onEmbedded(chunks.length);
        const timeMs = stopTimer({ chunksCount: chunks.length, tokensUsed: embeddingTokensUsed, concurrency: 1 });

        return { embeddedEntries, embeddingTokensUsed, timeMs };
    }

    private async stepGenerateEmbeddingsForChunksWithConcurrency(chunks: RawDocumentChunk[], concurrency: number, onProgress?: PdfIngestionWorker.IngestionProgress) {
        const stopTimer = this.metrics.startTimer("pdf-ingestion:generate-embeddings-parallel");
        const partitions = this.partitionItems(chunks, concurrency);

        const partitionResults = await this.promiseProvider.runAll(
            partitions.map(partition => async () => {
                const { results, tokensUsed } = await this.embeddingProvider.embedMany(
                    partition.map(c => ({ id: this.identifierProvider.generate(), embedInput: c.embedInput, original: c }))
                );
                return { results, tokensUsed };
            }),
            concurrency
        );

        const embeddedEntries = partitionResults.flatMap(r => r.results);
        const embeddingTokensUsed = partitionResults.reduce((acc, r) => acc + r.tokensUsed, 0);

        onProgress?.onEmbedded(chunks.length);
        const timeMs = stopTimer({ chunksCount: chunks.length, tokensUsed: embeddingTokensUsed, concurrency });

        return { embeddedEntries, embeddingTokensUsed, timeMs };
    }

    private async stepSavePointsToVectorStore(documentId: string, embeddedEntries: EmbeddedDocumentEntry[], onProgress?: PdfIngestionWorker.IngestionProgress): Promise<number> {
        const stopTimer = this.metrics.startTimer("pdf-ingestion:save-to-vector-store");

        const points = this.mapToVectorPoints(documentId, embeddedEntries);
        await this.vectorStore.upsert(this.config.collectionName, points);

        onProgress?.onStored();
        return stopTimer({ pointsCount: points.length, documentId, concurrency: 1 });
    }

    private async stepSavePointsToVectorStoreWithConcurrency(documentId: string, embeddedEntries: EmbeddedDocumentEntry[], concurrency: number, onProgress?: PdfIngestionWorker.IngestionProgress): Promise<number> {
        const stopTimer = this.metrics.startTimer("pdf-ingestion:save-to-vector-store-parallel");

        const points = this.mapToVectorPoints(documentId, embeddedEntries);
        const batches = this.chunkItems(points, this.STORAGE_UPSERT_BATCH_SIZE);
        const effectiveConcurrency = Math.min(concurrency, batches.length);

        await this.promiseProvider.runAll(
            batches.map(batch => () => this.vectorStore.upsert(this.config.collectionName, batch)),
            effectiveConcurrency
        );

        onProgress?.onStored();
        return stopTimer({
            pointsCount: points.length,
            documentId,
            concurrency: effectiveConcurrency,
            batchCount: batches.length,
            batchSize: this.STORAGE_UPSERT_BATCH_SIZE,
        });
    }

    private mapToVectorPoints(documentId: string, embeddedEntries: EmbeddedDocumentEntry[]) {
        return embeddedEntries.map(({ entry, embedding }) => ({
            id: entry.id,
            vector: Array.from(embedding),
            payload: buildDocumentChunkPayload({
                documentId,
                chunkId: entry.id,
                content: entry.original.content,
                raw: entry.original.raw,
                page: entry.original.metadata?.base?.page,
                heading: entry.original.header ?? entry.original.metadata?.base?.section,
                metadata: entry.original.metadata,
                payload: entry.original,
            }),
        }));
    }

    private calculateTargetConcurrency(totalItems: number, maxConcurrency: number, minBatchSize: number): number {
        return Math.min(maxConcurrency, Math.ceil(totalItems / minBatchSize));
    }

    private partitionItems<T>(items: T[], numPartitions: number): T[][] {
        const batchSize = Math.ceil(items.length / numPartitions);
        const partitions: T[][] = [];
        for (let i = 0; i < items.length; i += batchSize) {
            partitions.push(items.slice(i, i + batchSize));
        }
        return partitions;
    }

    private chunkItems<T>(items: T[], batchSize: number): T[][] {
        const batches: T[][] = [];

        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }

        return batches;
    }

    private stepReturnEmptyResult(
        documentId: string,
        response: ProcessPdfResponse,
        timing: { ensureCollectionTimeMs: number; parseTimeMs: number; totalTimeMs: number }
    ): PdfIngestionWorker.Result {
        return {
            documentId,
            ensureCollectionTimeMs: timing.ensureCollectionTimeMs,
            parseTimeMs: timing.parseTimeMs,
            providerReportedParseTimeMs: response.processing_time_ms,
            embeddingTimeMs: 0,
            indexingTimeMs: 0,
            totalTimeMs: timing.totalTimeMs,
            embeddingTokensUsed: 0,
            entriesCount: 0,
            totalChars: response.total_chars,
            totalWords: response.total_words,
            raw: "",
            entries: [],
        };
    }
}

export namespace PdfIngestionWorker {
    export type Config = {
        collectionName: string;
    };

    export type IngestionProgress = {
        onParsed: (timeMs: number) => void;
        onEmbedded: (count: number) => void;
        onStored: () => void;
    };

    export type Input = {
        pdfBuffer: Buffer;
        parsedResponse?: ProcessPdfResponse;
        embeddingConcurrency?: number;
        storeConcurrency?: number;
        onProgress?: IngestionProgress;
        traceId?: string;
    };

    export type Result = {
        documentId: string;
        ensureCollectionTimeMs: number;
        parseTimeMs: number;
        providerReportedParseTimeMs?: number;
        embeddingTimeMs: number;
        indexingTimeMs: number;
        totalTimeMs: number;
        embeddingTokensUsed: number;
        entriesCount: number;
        totalChars: number;
        totalWords: number;
        raw: string;
        entries: ProcessedChunk[];
    };
}
