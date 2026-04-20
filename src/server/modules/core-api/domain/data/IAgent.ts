export interface IExtractionMetrics {
    tokensUsed: { prompt: number; completion: number; total: number };
}

export interface IExtractionResult<T> {
    data: T;
    metrics: IExtractionMetrics;
}

export interface IAgent<TContext, TResult> {
    /** 
     * Retorna a lista de queries em texto cru que este agente precisa para 
     * construir seu contexto a partir de uma busca vetorial (se aplicável).
     */
    getSearchQueries(): string[];

    /**
     * Executa a extração propriamente dita usando o contexto fornecido pelo orquestrador.
     * onPartialResult é chamado a cada lote concluído (quando aplicável) para streaming progressivo.
     */
    extract(
        context: TContext,
        onProgress?: (message: string, percent: number) => void,
        onPartialResult?: (partial: TResult, batchIndex: number, totalBatches: number) => void,
    ): Promise<IExtractionResult<TResult>>;
}
