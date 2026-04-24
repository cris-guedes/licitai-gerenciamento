import type { IEmbeddingProvider } from "@/server/modules/core-api/domain/data/IEmbeddingProvider";
import type { IVectorStore } from "@/server/modules/core-api/domain/data/IVectorStore";
import type { DocumentHandlerFileParsingProvider } from "@/server/shared/infra/providers/pdf/document-handler-file-parsing-provider";
import type { ProcessPdfResponse } from "@/server/shared/lib/document-handler/generated/models/ProcessPdfResponse";
import type { IIdentifierProvider } from "@/server/modules/core-api/domain/data/IIdentifierProvider";
import type { IPromiseProvider } from "@/server/modules/core-api/domain/data/IPromiseProvider";
import type { MetricsProvider } from "@/server/shared/infra/providers/metrics/metrics-provider";
import type { ProcessedChunk } from "@/server/modules/core-api/domain/data/ProcessedChunk";
import { performance } from "perf_hooks";

export class PdfIngestionWorker {
    private readonly MIN_EMBEDDING_BATCH_SIZE = 100;
    private readonly MIN_STORAGE_BATCH_SIZE = 500;

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
        embeddingConcurrency = 1,
        storeConcurrency = 1,
        onProgress
    }: PdfIngestionWorker.Input): Promise<PdfIngestionWorker.Result> {
        const ingestStartedAt = performance.now();

        const ensureCollectionTimeMs = await this.stepEnsureVectorCollectionExists();

        const { response, timeMs: parseTimeMs } = await this.stepParseDocument(pdfBuffer, documentId);

        const allChunks = this.stepExtractRawChunksFromResponse(response);
        onProgress?.onParsed(parseTimeMs);

        if (allChunks.length === 0) {
            return this.stepReturnEmptyResult(documentId, response, {
                ensureCollectionTimeMs,
                parseTimeMs,
                totalTimeMs: performance.now() - ingestStartedAt,
            });
        }

        // Decisão de concorrência para Embeddings
        const targetEmbeddingConcurrency = this.calculateTargetConcurrency(allChunks.length, embeddingConcurrency, this.MIN_EMBEDDING_BATCH_SIZE);
        const hasEmbeddingConcurrency = targetEmbeddingConcurrency > 1;

        const { embeddedEntries, embeddingTokensUsed, timeMs: embeddingTimeMs } = hasEmbeddingConcurrency
            ? await this.stepGenerateEmbeddingsForChunksWithConcurrency(allChunks, targetEmbeddingConcurrency, onProgress)
            : await this.stepGenerateEmbeddingsForChunks(allChunks, onProgress);

        // Decisão de concorrência para Storage
        const targetStoreConcurrency = this.calculateTargetConcurrency(embeddedEntries.length, storeConcurrency, this.MIN_STORAGE_BATCH_SIZE);
        const hasStoreConcurrency = targetStoreConcurrency > 1;

        const indexingTimeMs = hasStoreConcurrency
            ? await this.stepSavePointsToVectorStoreWithConcurrency(documentId, embeddedEntries, targetStoreConcurrency, onProgress)
            : await this.stepSavePointsToVectorStore(documentId, embeddedEntries, onProgress);

        // Mapear para ProcessedChunk garantindo que as propriedades obrigatórias do metadados existam
        const entries: ProcessedChunk[] = allChunks.map((c, i) => ({
            id: this.identifierProvider.generate(),
            embedInput: c.embedInput,
            content: c.content,
            raw: c.raw ?? c.content,
            metadata: {
                ...c.metadata,
                type: c.metadata.base?.type ?? "text",
                page: c.metadata.base?.page ?? 0,
                origin: c.metadata.base?.origin ?? documentId,
                chunk_index: i,
                word_count: c.content.split(/\s+/).length,
            }
        }));

        const totalTimeMs = performance.now() - ingestStartedAt;

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
            payloadIndexFields: ["document_id", "metadata.base.type", "metadata.base.page"],
        });
        return stopTimer({ collectionName: this.config.collectionName });
    }

    private async stepParseDocument(buffer: Buffer, documentId: string): Promise<{ response: ProcessPdfResponse; timeMs: number }> {
        const stopTimer = this.metrics.startTimer("pdf-ingestion:parse-document");
        const response = await this.documentParser.process(buffer, documentId);
        const timeMs = stopTimer({ documentId, providerReportedParseTimeMs: response.processing_time_ms });
        return { response, timeMs };
    }

    private stepExtractRawChunksFromResponse(response: ProcessPdfResponse): any[] {
        const chunks: any[] = [];

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
                const rowContent = Object.values(chunk.data).join(" | ");
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

    private async stepGenerateEmbeddingsForChunks(chunks: any[], onProgress?: PdfIngestionWorker.IngestionProgress) {
        const stopTimer = this.metrics.startTimer("pdf-ingestion:generate-embeddings");

        const { results: embeddedEntries, tokensUsed: embeddingTokensUsed } = await this.embeddingProvider.embedMany(
            chunks.map(c => ({ id: this.identifierProvider.generate(), embedInput: c.embedInput, original: c }))
        );

        onProgress?.onEmbedded(chunks.length);
        const timeMs = stopTimer({ chunksCount: chunks.length, tokensUsed: embeddingTokensUsed, concurrency: 1 });

        return { embeddedEntries, embeddingTokensUsed, timeMs };
    }

    private async stepGenerateEmbeddingsForChunksWithConcurrency(chunks: any[], concurrency: number, onProgress?: PdfIngestionWorker.IngestionProgress) {
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

    private async stepSavePointsToVectorStore(documentId: string, embeddedEntries: Array<{ entry: any; embedding: Float32Array }>, onProgress?: PdfIngestionWorker.IngestionProgress): Promise<number> {
        const stopTimer = this.metrics.startTimer("pdf-ingestion:save-to-vector-store");

        const points = this.mapToVectorPoints(documentId, embeddedEntries);
        await this.vectorStore.upsert(this.config.collectionName, points);

        onProgress?.onStored();
        return stopTimer({ pointsCount: points.length, documentId, concurrency: 1 });
    }

    private async stepSavePointsToVectorStoreWithConcurrency(documentId: string, embeddedEntries: Array<{ entry: any; embedding: Float32Array }>, concurrency: number, onProgress?: PdfIngestionWorker.IngestionProgress): Promise<number> {
        const stopTimer = this.metrics.startTimer("pdf-ingestion:save-to-vector-store-parallel");

        const points = this.mapToVectorPoints(documentId, embeddedEntries);
        const partitions = this.partitionItems(points, concurrency);

        await this.promiseProvider.runAll(
            partitions.map(p => () => this.vectorStore.upsert(this.config.collectionName, p)),
            concurrency
        );

        onProgress?.onStored();
        return stopTimer({ pointsCount: points.length, documentId, concurrency });
    }

    private mapToVectorPoints(documentId: string, embeddedEntries: Array<{ entry: any; embedding: Float32Array }>) {
        return embeddedEntries.map(({ entry, embedding }) => ({
            id: entry.id,
            vector: Array.from(embedding),
            payload: { ...entry.original, document_id: documentId },
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
        embeddingConcurrency?: number;
        storeConcurrency?: number;
        onProgress?: IngestionProgress;
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
