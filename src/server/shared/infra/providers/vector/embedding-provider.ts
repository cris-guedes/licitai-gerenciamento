export interface ChunkMetadata {
    tipo?: string;
    titulo?: string;
    tem_tabela?: boolean;
    tem_lista?: boolean;
    conteudo: string;
}

export type EmbedInput = string | ChunkMetadata;

export class EmbeddingProvider {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private extractor: any = null;
    private initPromise: Promise<void> | null = null;
    
    // Atualização do modelo para um mais adequado para Busca Semântica
    readonly MODEL_NAME = "Xenova/multilingual-e5-small";
    private readonly batchSize = Number(process.env.EMBEDDING_PROVIDER_BATCH_SIZE ?? (process.env.VERCEL ? "8" : "25"));

    async init(): Promise<void> {
        if (this.initPromise) return this.initPromise;
        this.initPromise = this._init();
        return this.initPromise;
    }

    private async _init(): Promise<void> {
        const { pipeline } = await import("@xenova/transformers");
        
        // intfloat/multilingual-e5-small suporta pooling 'mean' implicitamente
        // para obter os embeddings corretos no transformers.js
        this.extractor = await pipeline("feature-extraction", this.MODEL_NAME, {
            quantized: true,
        });
    }

    /**
     * Prepara e sanitiza o texto, removendo excesso de espaços.
     * Além disso, prefixa o input com "passage: " para otimizar os embeddings de E5,
     * a menos que o text já contenha o prefixo de "query: ".
     */
    private prepareText(text: string, isQuery = false): string {
        // Limpar espaços excessivos
        let cleanText = text.replace(/\s+/g, ' ').trim();
        
        // E5 model requer os prefixos "query:" para buscas e "passage:" para documentos
        if (isQuery) {
            return cleanText.startsWith("query: ") ? cleanText : `query: ${cleanText}`;
        }
        return cleanText.startsWith("passage: ") ? cleanText : `passage: ${cleanText}`;
    }

    /**
     * Enriquecimento semântico: Converte informações estruturais em uma 
     * string unificada e enriquecida, adicionando mais contexto para o LLM/Embeddings.
     */
    private enrichChunk(chunk: EmbedInput): string {
        // Se for apenas texto simples, assumimos que é uma passage sem metadados
        if (typeof chunk === 'string') {
            return chunk;
        }

        // Formatar para incluir apenas dados presentes
        const parts: string[] = [];
        if (chunk.tipo) parts.push(`tipo: ${chunk.tipo}`);
        if (chunk.titulo) parts.push(`titulo: ${chunk.titulo}`);
        if (chunk.tem_tabela !== undefined) parts.push(`tem_tabela: ${chunk.tem_tabela ? 'sim' : 'não'}`);
        if (chunk.tem_lista !== undefined) parts.push(`tem_lista: ${chunk.tem_lista ? 'sim' : 'não'}`);
        parts.push(`conteudo: ${chunk.conteudo}`);

        return parts.join('\n');
    }

    /**
     * Gera embedding para um único texto/chunk
     */
    async embed(input: EmbedInput, isQuery = false): Promise<Float32Array> {
        await this.init();
        
        const enrichedText = this.enrichChunk(input);
        const preparedText = this.prepareText(enrichedText, isQuery);

        // O Transformers.js aceita "cls" ou "mean", usaremos 'mean' com normalize true
        // pois é recomendado para obter cosseno via dot-product com modelos E5.
        const output = await this.extractor(preparedText, { 
            pooling: "mean", 
            normalize: true 
        });

        // Transformers.js pode retornar Float32Array ou array de Arrays. O `.data` geralmente obtém o array liso
        return output.data as Float32Array;
    }

    /**
     * Processamento em BATCH eficiente de múltiplos chunks, fazendo uma única chamada.
     * onBatch(completed, total) é chamado após cada lote concluído.
     */
    async embedMany(
        inputs:    EmbedInput[],
        isQuery =  false,
        onBatch?: (completed: number, total: number) => void,
    ): Promise<Float32Array[]> {
        await this.init();

        if (inputs.length === 0) return [];

        const allEmbeddings: Float32Array[] = [];

        for (let i = 0; i < inputs.length; i += this.batchSize) {
            const batchInputs = inputs.slice(i, i + this.batchSize);
            
            // Enriquecer, limpar espaçamentos extras e adicionar "passage: " ou "query: "
            const preparedTexts = batchInputs.map(input => {
                const enriched = this.enrichChunk(input);
                return this.prepareText(enriched, isQuery); 
            });

            // O transformers.js em versão mais recente suporta batch processing 
            // caso os textos sejam passados como array
            // pooling="mean" e normalize=true garantem os vetores na escala correta
            const output = await this.extractor(preparedTexts, { 
                pooling: "mean", 
                normalize: true 
            });

            // Evita output.tolist(), que duplica a matriz inteira em memória JS.
            const dims = Array.isArray(output.dims) ? output.dims : [];
            const data = output.data as Float32Array;

            if (dims.length >= 2 && typeof dims[0] === "number" && typeof dims[1] === "number") {
                const rows = dims[0];
                const cols = dims[1];

                for (let j = 0; j < rows; j++) {
                    const start = j * cols;
                    const end = start + cols;
                    allEmbeddings.push(new Float32Array(data.subarray(start, end)));
                }
            } else {
                allEmbeddings.push(new Float32Array(data));
            }

            onBatch?.(Math.min(i + batchInputs.length, inputs.length), inputs.length);
        }

        return allEmbeddings;
    }
}

export namespace EmbeddingProvider {
    export type Contract = EmbeddingProvider;
}
