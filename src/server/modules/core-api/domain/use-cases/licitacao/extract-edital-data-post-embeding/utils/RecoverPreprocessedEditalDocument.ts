import type { ProcessedChunk } from "@/server/modules/core-api/domain/data/ProcessedChunk";
import type { IVectorStore } from "@/server/modules/core-api/domain/data/IVectorStore";
import type { PdfIngestionWorker } from "@/server/modules/core-api/workers/pdf-ingestion/PdfIngestionWorker";
import type { TableIngestionWorker } from "@/server/modules/core-api/workers/pdf-ingestion/TableIngestionWorker";

type ChunkType = "text" | "table_row";

type RecoverPreprocessedEditalDocumentInput = {
    documentId: string;
    collectionName: string;
    originalFilename: string;
};

type RecoverPreprocessedEditalDocumentOutput = {
    infoIngestionResult: PdfIngestionWorker.Result;
    itemsIngestionResult: TableIngestionWorker.Result;
};

export class RecoverPreprocessedEditalDocument {
    constructor(private readonly vectorStore: IVectorStore.Contract) { }

    async execute(
        input: RecoverPreprocessedEditalDocumentInput,
    ): Promise<RecoverPreprocessedEditalDocumentOutput> {
        const allEntries = await this.loadEntries(input, ["text", "table_row"]);

        if (allEntries.length === 0) {
            throw new Error("O documento informado não possui chunks indexados para reutilizar a extração.");
        }

        const tableEntries = allEntries.filter(entry => entry.metadata.type === "table_row");

        return {
            infoIngestionResult: this.buildInfoIngestionResult(input.documentId, allEntries),
            itemsIngestionResult: this.buildItemsIngestionResult(input.documentId, tableEntries),
        };
    }

    private async loadEntries(
        input: RecoverPreprocessedEditalDocumentInput,
        types: ChunkType[],
    ): Promise<ProcessedChunk[]> {
        const points = await this.scrollAllPoints(input.collectionName, {
            must: [
                { key: "document_id", match: { value: input.documentId } },
                { key: "metadata.base.type", match: { any: types } },
            ],
        });

        return points
            .map((point, index) => this.toProcessedChunk(point, input.originalFilename, index))
            .filter((entry): entry is ProcessedChunk => entry !== null)
            .sort((a, b) => {
                const pageDiff = a.metadata.page - b.metadata.page;
                if (pageDiff !== 0) return pageDiff;
                return a.metadata.chunk_index - b.metadata.chunk_index;
            });
    }

    private async scrollAllPoints(collectionName: string, filter: IVectorStore.Filter) {
        const points: IVectorStore.ScrollPoint[] = [];
        let offset: string | number | null = null;

        do {
            const response = await this.vectorStore.scroll(collectionName, {
                filter,
                limit: 1000,
                offset: offset ?? undefined,
            });

            points.push(...response.points);
            offset = response.nextOffset;
        } while (offset != null);

        return points;
    }

    private toProcessedChunk(
        point: IVectorStore.ScrollPoint,
        originalFilename: string,
        fallbackIndex: number,
    ): ProcessedChunk | null {
        const payload = point.payload ?? {};
        const content = typeof payload.content === "string" ? payload.content.trim() : "";
        if (!content) return null;

        const base = this.readBaseMetadata(payload);
        const type: ProcessedChunk["metadata"]["type"] = base.type === "table_row" ? "table_row" : "text";
        const page = this.toNumber(base.page) ?? 0;
        const chunkIndex = this.toNumber(base.chunk_index) ?? fallbackIndex;
        const origin = this.toString(base.origin) ?? originalFilename;
        const raw = typeof payload.raw === "string" && payload.raw.trim() ? payload.raw : content;
        const metadata = {
            ...base,
            type,
            page,
            origin,
            word_count: this.countWords(content),
            chunk_index: chunkIndex,
            id: String(point.id),
        };

        return {
            id: String(point.id),
            embedInput: content,
            content,
            raw,
            metadata,
        };
    }

    private readBaseMetadata(payload: Record<string, unknown>): Record<string, unknown> {
        if (
            "metadata" in payload &&
            payload.metadata &&
            typeof payload.metadata === "object" &&
            "base" in (payload.metadata as Record<string, unknown>) &&
            (payload.metadata as Record<string, unknown>).base &&
            typeof (payload.metadata as Record<string, unknown>).base === "object"
        ) {
            return { ...((payload.metadata as Record<string, unknown>).base as Record<string, unknown>) };
        }

        return {};
    }

    private buildInfoIngestionResult(documentId: string, entries: ProcessedChunk[]): PdfIngestionWorker.Result {
        return {
            documentId,
            ensureCollectionTimeMs: 0,
            parseTimeMs: 0,
            providerReportedParseTimeMs: 0,
            embeddingTimeMs: 0,
            indexingTimeMs: 0,
            totalTimeMs: 0,
            embeddingTokensUsed: 0,
            entriesCount: entries.length,
            totalChars: entries.reduce((sum, entry) => sum + entry.content.length, 0),
            totalWords: entries.reduce((sum, entry) => sum + entry.metadata.word_count, 0),
            raw: entries.map(entry => entry.content).join("\n\n"),
            entries,
        };
    }

    private buildItemsIngestionResult(documentId: string, entries: ProcessedChunk[]): TableIngestionWorker.Result {
        const markdownRows = Array.from(new Set(entries.map(entry => entry.raw).filter(Boolean)));

        return {
            documentId,
            ensureCollectionTimeMs: 0,
            parseTimeMs: 0,
            embeddingTimeMs: 0,
            indexingTimeMs: 0,
            totalTimeMs: 0,
            entriesCount: entries.length,
            raw: markdownRows.join("\n\n"),
            totalChars: entries.reduce((sum, entry) => sum + entry.content.length, 0),
            totalWords: entries.reduce((sum, entry) => sum + entry.metadata.word_count, 0),
            embeddingTokensUsed: 0,
            entries,
        };
    }

    private countWords(content: string) {
        const matches = content.match(/\S+/g);
        return matches?.length ?? 0;
    }

    private toNumber(value: unknown): number | null {
        return typeof value === "number" && Number.isFinite(value) ? value : null;
    }

    private toString(value: unknown): string | null {
        return typeof value === "string" && value.trim() ? value : null;
    }
}

export namespace RecoverPreprocessedEditalDocument {
    export type Input = RecoverPreprocessedEditalDocumentInput;
    export type Output = RecoverPreprocessedEditalDocumentOutput;
}
