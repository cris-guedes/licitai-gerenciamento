/**
 * Tipos de entrada compartilhados por todos os providers de embedding.
 */
export interface ChunkMetadata {
    type?: string;
    title?: string;
    tags?: string[];
    content: string;
}

export type EmbedInput = string | ChunkMetadata;

/**
 * Converte um EmbedInput estruturado em texto plano enriquecido.
 * Função utilitária compartilhada entre implementações de providers.
 */
export function enrichEmbedInput(input: EmbedInput): string {
    if (typeof input === "string") return input;

    const parts: string[] = [];
    if (input.type)           parts.push(`type: ${input.type}`);
    if (input.title)          parts.push(`title: ${input.title}`);
    if (input.tags?.length)   parts.push(`tags: ${input.tags.join(", ")}`);
    parts.push(`content: ${input.content}`);

    return parts.join("\n");
}

/**
 * Contrato que todo provider de embedding deve implementar.
 * Reside na camada de domínio para que casos de uso e serviços de infra
 * dependam da abstração, não da implementação concreta.
 */
export interface IEmbeddingProvider {
    /** Nome/identificador do modelo em uso */
    readonly modelName: string;

    /** Dimensão dos vetores gerados por este modelo */
    readonly dimensions: number;

    /**
     * Gera embedding para um único texto ou chunk estruturado.
     * @param isQuery - true para queries de busca; false (padrão) para documentos/passagens
     */
    embed(input: EmbedInput, isQuery?: boolean): Promise<Float32Array>;

    /**
     * Gera embeddings em lote com processamento eficiente.
     * @param onBatch - callback opcional chamado após cada lote: (concluídos, total)
     */
    embedMany<T extends { embedInput: EmbedInput }>(
        entries: T[],
        isQuery?: boolean,
        onBatch?: (completed: number, total: number) => void,
    ): Promise<{ results: Array<{ entry: T; embedding: Float32Array }>; tokensUsed: number }>;
}
