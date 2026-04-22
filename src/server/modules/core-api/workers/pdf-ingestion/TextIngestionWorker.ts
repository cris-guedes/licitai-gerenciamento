import type { IEmbeddingProvider } from "@/server/modules/core-api/domain/data/IEmbeddingProvider";
import type { IVectorStore } from "@/server/modules/core-api/domain/data/IVectorStore";
import type { DocumentHandlerFileParsingProvider } from "@/server/shared/infra/providers/pdf/document-handler-file-parsing-provider";
import type { ExtractResponse } from "@/server/shared/lib/document-handler/generated/models/ExtractResponse";
import type { ChunkSchema } from "@/server/shared/lib/document-handler/generated/models/ChunkSchema";
import type { IIdentifierProvider } from "@/server/modules/core-api/domain/data/IIdentifierProvider";
import type { IPromiseProvider } from "@/server/modules/core-api/domain/data/IPromiseProvider";
import type { MetricsProvider } from "@/server/shared/infra/providers/metrics/metrics-provider";

export class TextIngestionWorker {
    private readonly MIN_EMBEDDING_BATCH_SIZE = 100;
    private readonly MIN_STORAGE_BATCH_SIZE   = 500;

    constructor(
        private readonly documentParser:    DocumentHandlerFileParsingProvider.Contract,
        private readonly embeddingProvider: IEmbeddingProvider,
        private readonly vectorStore:       IVectorStore.Contract,
        private readonly identifierProvider: IIdentifierProvider,
        private readonly promiseProvider:   IPromiseProvider,
        private readonly metrics:           MetricsProvider.Contract,
        private readonly config:            TextIngestionWorker.Config,
    ) { }

    async ingest(documentId: string, { 
        pdfBuffer, 
        embeddingConcurrency = 1, 
        storeConcurrency = 1, 
        onProgress 
    }: TextIngestionWorker.Input): Promise<TextIngestionWorker.Result> {

        await this.stepEnsureVectorCollectionExists();

        const response = await this.stepParseDocument(pdfBuffer, documentId);
        const { chunks } = response;

        if (!chunks || chunks.length === 0) {
            return { documentId, entriesCount: 0, timeMs: 0 };
        }

        // Decisão de concorrência para Embeddings
        const targetEmbeddingConcurrency = this.calculateTargetConcurrency(chunks.length, embeddingConcurrency, this.MIN_EMBEDDING_BATCH_SIZE);
        const hasEmbeddingConcurrency    = targetEmbeddingConcurrency > 1;

        const { embeddedEntries, timeMs: embeddingTimeMs } = hasEmbeddingConcurrency
            ? await this.stepGenerateEmbeddingsForChunksWithConcurrency(chunks, targetEmbeddingConcurrency, onProgress)
            : await this.stepGenerateEmbeddingsForChunks(chunks, onProgress);

        // Decisão de concorrência para Storage
        const targetStoreConcurrency = this.calculateTargetConcurrency(embeddedEntries.length, storeConcurrency, this.MIN_STORAGE_BATCH_SIZE);
        const hasStoreConcurrency    = targetStoreConcurrency > 1;

        hasStoreConcurrency
            ? await this.stepSavePointsToVectorStoreWithConcurrency(documentId, response, embeddedEntries, targetStoreConcurrency, onProgress)
            : await this.stepSavePointsToVectorStore(documentId, response, embeddedEntries, onProgress);

        return {
            documentId,
            entriesCount: chunks.length,
            timeMs:       embeddingTimeMs,
            raw:          response.raw,
        };
    }

    private async stepEnsureVectorCollectionExists(): Promise<void> {
        await this.vectorStore.ensureCollection(this.config.collectionName, {
            vectorSize:         this.embeddingProvider.dimensions,
            payloadIndexFields: ["document_id", "metadata.base.type", "metadata.base.page"],
        });
    }

    private async stepParseDocument(buffer: Buffer, documentId: string): Promise<ExtractResponse> {
        return this.documentParser.processText(buffer, documentId);
    }

    private async stepGenerateEmbeddingsForChunks(chunks: ChunkSchema[], onProgress?: TextIngestionWorker.IngestionProgress) {
        const stopTimer = this.metrics.startTimer("text-ingestion:generate-embeddings");
        
        const { results: embeddedEntries } = await this.embeddingProvider.embedMany(
            chunks.map(c => ({ id: this.identifierProvider.generate(), embedInput: c.content, chunk: c }))
        );

        onProgress?.onEmbedded?.(chunks.length);
        const timeMs = stopTimer({ chunksCount: chunks.length, concurrency: 1 });
        
        return { embeddedEntries, timeMs };
    }

    private async stepGenerateEmbeddingsForChunksWithConcurrency(chunks: ChunkSchema[], concurrency: number, onProgress?: TextIngestionWorker.IngestionProgress) {
        const stopTimer = this.metrics.startTimer("text-ingestion:generate-embeddings-parallel");
        const partitions = this.partitionItems(chunks, concurrency);
        
        const partitionResults = await this.promiseProvider.runAll(
            partitions.map(partition => async () => {
                const { results } = await this.embeddingProvider.embedMany(
                    partition.map(c => ({ id: this.identifierProvider.generate(), embedInput: c.content, chunk: c }))
                );
                return results;
            }),
            concurrency
        );

        const embeddedEntries = partitionResults.flat();
        onProgress?.onEmbedded?.(chunks.length);
        const timeMs = stopTimer({ chunksCount: chunks.length, concurrency });
        
        return { embeddedEntries, timeMs };
    }

    private async stepSavePointsToVectorStore(documentId: string, response: ExtractResponse, embeddedEntries: Array<{ entry: any; embedding: Float32Array }>, onProgress?: TextIngestionWorker.IngestionProgress): Promise<void> {
        const stopTimer = this.metrics.startTimer("text-ingestion:save-to-vector-store");
        
        const points = this.mapToVectorPoints(documentId, response, embeddedEntries);
        await this.vectorStore.upsert(this.config.collectionName, points);

        onProgress?.onStored?.();
        stopTimer({ pointsCount: points.length, documentId, concurrency: 1 });
    }

    private async stepSavePointsToVectorStoreWithConcurrency(documentId: string, response: ExtractResponse, embeddedEntries: Array<{ entry: any; embedding: Float32Array }>, concurrency: number, onProgress?: TextIngestionWorker.IngestionProgress): Promise<void> {
        const stopTimer = this.metrics.startTimer("text-ingestion:save-to-vector-store-parallel");
        
        const points     = this.mapToVectorPoints(documentId, response, embeddedEntries);
        const partitions = this.partitionItems(points, concurrency);
        
        await this.promiseProvider.runAll(
            partitions.map(p => () => this.vectorStore.upsert(this.config.collectionName, p)),
            concurrency
        );

        onProgress?.onStored?.();
        stopTimer({ pointsCount: points.length, documentId, concurrency });
    }

    private mapToVectorPoints(documentId: string, response: ExtractResponse, embeddedEntries: Array<{ entry: any; embedding: Float32Array }>) {
        return embeddedEntries.map(({ entry, embedding }) => ({
            id:      entry.id,
            vector:  Array.from(embedding),
            payload: { ...entry.chunk, raw: response.raw, document_id: documentId },
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
}

export namespace TextIngestionWorker {
    export type Config = {
        collectionName: string;
    };

    export type IngestionProgress = {
        onEmbedded?: (count: number) => void;
        onStored?:   () => void;
    };

    export type Input = {
        pdfBuffer:             Buffer;
        embeddingConcurrency?: number;
        storeConcurrency?:     number;
        onProgress?:           IngestionProgress;
    };

    export type Result = {
        documentId:   string;
        entriesCount: number;
        timeMs:       number;
        raw?:         string;
    };
}
