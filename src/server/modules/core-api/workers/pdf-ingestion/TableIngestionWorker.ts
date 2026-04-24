import type { IEmbeddingProvider } from "@/server/modules/core-api/domain/data/IEmbeddingProvider";
import type { IVectorStore } from "@/server/modules/core-api/domain/data/IVectorStore";
import type { DocumentHandlerFileParsingProvider } from "@/server/shared/infra/providers/pdf/document-handler-file-parsing-provider";
import type { ExtractResponse } from "@/server/shared/lib/document-handler/generated/models/ExtractResponse";
import type { ChunkSchema } from "@/server/shared/lib/document-handler/generated/models/ChunkSchema";
import type { IIdentifierProvider } from "@/server/modules/core-api/domain/data/IIdentifierProvider";
import type { IPromiseProvider } from "@/server/modules/core-api/domain/data/IPromiseProvider";
import type { MetricsProvider } from "@/server/shared/infra/providers/metrics/metrics-provider";
import type { ProcessedChunk } from "@/server/modules/core-api/domain/data/ProcessedChunk";
import { performance } from "perf_hooks";

export class TableIngestionWorker {
    private readonly MIN_EMBEDDING_BATCH_SIZE = 100;
    private readonly MIN_STORAGE_BATCH_SIZE = 500;

    constructor(
        private readonly documentParser: DocumentHandlerFileParsingProvider.Contract,
        private readonly embeddingProvider: IEmbeddingProvider,
        private readonly vectorStore: IVectorStore.Contract,
        private readonly identifierProvider: IIdentifierProvider,
        private readonly promiseProvider: IPromiseProvider,
        private readonly metrics: MetricsProvider.Contract,
        private readonly config: TableIngestionWorker.Config,
    ) { }

    async ingest(documentId: string, {
        pdfBuffer,
        embeddingConcurrency = 1,
        storeConcurrency = 1,
        onProgress
    }: TableIngestionWorker.Input): Promise<TableIngestionWorker.Result> {
        const ingestStartedAt = performance.now();

        const ensureCollectionTimeMs = await this.stepEnsureVectorCollectionExists();

        const { response, timeMs: parseTimeMs } = await this.stepParseDocument(pdfBuffer, documentId);
        const { chunks } = response;
        const raw = response.raw || chunks.map(chunk => chunk.content).join("\n");
        const totalChars = raw.length;
        const totalWords = this.countWords(raw);

        onProgress?.onParsed?.(parseTimeMs);

        if (!chunks || chunks.length === 0) {
            return {
                documentId,
                ensureCollectionTimeMs,
                parseTimeMs,
                embeddingTimeMs: 0,
                indexingTimeMs: 0,
                totalTimeMs: performance.now() - ingestStartedAt,
                raw,
                totalChars,
                totalWords,
                embeddingTokensUsed: 0,
                entriesCount: 0,
                entries: [],
            };
        }

        // Decisão de concorrência para Embeddings
        const targetEmbeddingConcurrency = this.calculateTargetConcurrency(chunks.length, embeddingConcurrency, this.MIN_EMBEDDING_BATCH_SIZE);
        const hasEmbeddingConcurrency = targetEmbeddingConcurrency > 1;

        const { embeddedEntries, embeddingTokensUsed, timeMs: embeddingTimeMs } = hasEmbeddingConcurrency
            ? await this.stepGenerateEmbeddingsForChunksWithConcurrency(chunks, targetEmbeddingConcurrency, onProgress)
            : await this.stepGenerateEmbeddingsForChunks(chunks, onProgress);

        // Decisão de concorrência para Storage
        const targetStoreConcurrency = this.calculateTargetConcurrency(embeddedEntries.length, storeConcurrency, this.MIN_STORAGE_BATCH_SIZE);
        const hasStoreConcurrency = targetStoreConcurrency > 1;

        const indexingTimeMs = hasStoreConcurrency
            ? await this.stepSavePointsToVectorStoreWithConcurrency(documentId, embeddedEntries, targetStoreConcurrency, onProgress)
            : await this.stepSavePointsToVectorStore(documentId, embeddedEntries, onProgress);

        // Mapear para ProcessedChunk garantindo que as propriedades obrigatórias existam
        const finalEntries: ProcessedChunk[] = chunks.map((c, i) => ({
            id: this.identifierProvider.generate(),
            embedInput: c.content,
            content: c.content,
            raw: c.content,
            metadata: {
                ...c.metadata,
                type: c.metadata.base?.type ?? "table_row",
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
            embeddingTimeMs,
            indexingTimeMs,
            totalTimeMs,
            entriesCount: chunks.length,
            raw,
            totalChars,
            totalWords,
            embeddingTokensUsed,
            entries: finalEntries,
        };
    }

    private async stepEnsureVectorCollectionExists(): Promise<number> {
        const stopTimer = this.metrics.startTimer("table-ingestion:ensure-collection");
        await this.vectorStore.ensureCollection(this.config.collectionName, {
            vectorSize: this.embeddingProvider.dimensions,
            payloadIndexFields: ["document_id", "metadata.base.type", "metadata.base.page"],
        });
        return stopTimer({ collectionName: this.config.collectionName });
    }

    private async stepParseDocument(buffer: Buffer, documentId: string): Promise<{ response: ExtractResponse; timeMs: number }> {
        const stopTimer = this.metrics.startTimer("table-ingestion:parse-document");
        const response = await this.documentParser.processTables(buffer, documentId);
        const timeMs = stopTimer({ documentId, chunksCount: response.chunks.length });
        return { response, timeMs };
    }

    private async stepGenerateEmbeddingsForChunks(chunks: ChunkSchema[], onProgress?: TableIngestionWorker.IngestionProgress) {
        const stopTimer = this.metrics.startTimer("table-ingestion:generate-embeddings");

        const { results: embeddedEntries, tokensUsed: embeddingTokensUsed } = await this.embeddingProvider.embedMany(
            chunks.map(c => ({ id: this.identifierProvider.generate(), embedInput: c.content, chunk: c }))
        );

        onProgress?.onEmbedded?.(chunks.length);
        const timeMs = stopTimer({ chunksCount: chunks.length, concurrency: 1 });

        return { embeddedEntries, embeddingTokensUsed, timeMs };
    }

    private async stepGenerateEmbeddingsForChunksWithConcurrency(chunks: ChunkSchema[], concurrency: number, onProgress?: TableIngestionWorker.IngestionProgress) {
        const stopTimer = this.metrics.startTimer("table-ingestion:generate-embeddings-parallel");
        const partitions = this.partitionItems(chunks, concurrency);

        const partitionResults = await this.promiseProvider.runAll(
            partitions.map(partition => async () => {
                const { results, tokensUsed } = await this.embeddingProvider.embedMany(
                    partition.map(c => ({ id: this.identifierProvider.generate(), embedInput: c.content, chunk: c }))
                );
                return { results, tokensUsed };
            }),
            concurrency
        );

        const embeddedEntries = partitionResults.flatMap(r => r.results);
        const embeddingTokensUsed = partitionResults.reduce((acc, r) => acc + r.tokensUsed, 0);

        onProgress?.onEmbedded?.(chunks.length);
        const timeMs = stopTimer({ chunksCount: chunks.length, concurrency });

        return { embeddedEntries, embeddingTokensUsed, timeMs };
    }

    private async stepSavePointsToVectorStore(documentId: string, embeddedEntries: Array<{ entry: any; embedding: Float32Array }>, onProgress?: TableIngestionWorker.IngestionProgress): Promise<number> {
        const stopTimer = this.metrics.startTimer("table-ingestion:save-to-vector-store");

        const points = this.mapToVectorPoints(documentId, embeddedEntries);
        await this.vectorStore.upsert(this.config.collectionName, points);

        onProgress?.onStored?.();
        return stopTimer({ pointsCount: points.length, documentId, concurrency: 1 });
    }

    private async stepSavePointsToVectorStoreWithConcurrency(documentId: string, embeddedEntries: Array<{ entry: any; embedding: Float32Array }>, concurrency: number, onProgress?: TableIngestionWorker.IngestionProgress): Promise<number> {
        const stopTimer = this.metrics.startTimer("table-ingestion:save-to-vector-store-parallel");

        const points = this.mapToVectorPoints(documentId, embeddedEntries);
        const partitions = this.partitionItems(points, concurrency);

        await this.promiseProvider.runAll(
            partitions.map(p => () => this.vectorStore.upsert(this.config.collectionName, p)),
            concurrency
        );

        onProgress?.onStored?.();
        return stopTimer({ pointsCount: points.length, documentId, concurrency });
    }

    private mapToVectorPoints(documentId: string, embeddedEntries: Array<{ entry: any; embedding: Float32Array }>) {
        return embeddedEntries.map(({ entry, embedding }) => ({
            id: entry.id,
            vector: Array.from(embedding),
            payload: { ...entry.chunk, document_id: documentId },
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

    private countWords(text: string): number {
        const matches = text.match(/\S+/g);
        return matches?.length ?? 0;
    }
}

export namespace TableIngestionWorker {
    export type Config = {
        collectionName: string;
    };

    export type IngestionProgress = {
        onParsed?: (timeMs: number) => void;
        onEmbedded?: (count: number) => void;
        onStored?: () => void;
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
        embeddingTimeMs: number;
        indexingTimeMs: number;
        totalTimeMs: number;
        entriesCount: number;
        raw: string;
        totalChars: number;
        totalWords: number;
        embeddingTokensUsed: number;
        entries: ProcessedChunk[];
    };
}
