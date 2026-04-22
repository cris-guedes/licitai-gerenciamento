export interface IExtractionMetrics {
    tokensUsed: { prompt: number; completion: number; total: number };
}

export interface IExtractionResult<T> {
    data: T;
    metrics: IExtractionMetrics;
}

export interface IAgent<TContext, TResult> {
    getSearchQueries(): string[];

    extract(
        context:     TContext,
        onProgress?: (message: string, percent: number) => void,
    ): Promise<IExtractionResult<TResult>>;
}
