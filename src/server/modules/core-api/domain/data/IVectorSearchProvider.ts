export interface IVectorSearchProvider {
    search(input: IVectorSearchProvider.SearchInput): Promise<IVectorSearchProvider.SearchResult[]>;
}

export namespace IVectorSearchProvider {
    export type SearchInput = {
        documentId: string;
        query: string;
        limit: number;
        minScore?: number;
    };

    export type SearchResult = {
        chunkId: string;
        content: string;
        page?: number;
        heading?: string;
        score: number;
        metadata?: unknown;
    };
}
