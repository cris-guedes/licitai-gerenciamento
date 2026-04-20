import type { IEmbeddingProvider, EmbedInput } from "@/server/modules/core-api/domain/data/IEmbeddingProvider";
import { enrichEmbedInput } from "@/server/modules/core-api/domain/data/IEmbeddingProvider";

export interface LocalEmbeddingProviderOptions {
    /** Modelo HuggingFace carregado via @xenova/transformers. Default: "Xenova/multilingual-e5-small" */
    modelName?: string;
    /** Textos processados por chamada ao modelo. Default: env EMBEDDING_PROVIDER_BATCH_SIZE ou 25 (local) / 8 (Vercel) */
    batchSize?: number;
    /** Usar modelo quantizado ONNX int8. Default: true */
    quantized?: boolean;
    /** Estratégia de pooling dos tokens. Default: "mean" */
    pooling?: "mean" | "cls";
    /** Normalizar vetores L2 (habilita similaridade via dot-product). Default: true */
    normalize?: boolean;
    /** Prefixo injetado em queries de busca (padrão E5). Default: "query: " */
    queryPrefix?: string;
    /** Prefixo injetado em documentos/passagens (padrão E5). Default: "passage: " */
    /** Prefixo injetado em documentos/passagens (padrão E5). Default: "passage: " */
    passagePrefix?: string;
    /** Dimensão manual dos vetores. Default: 384 (para e5-small). */
    dimensions?: number;
}

/**
 * Provider de embedding local usando @xenova/transformers (ONNX, roda no Node sem GPU).
 */
export class LocalEmbeddingProvider implements IEmbeddingProvider {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private extractor: any = null;
    private initPromise: Promise<void> | null = null;

    readonly modelName: string;
    readonly dimensions: number;
    private readonly batchSize: number;
    private readonly quantized: boolean;
    private readonly pooling: "mean" | "cls";
    private readonly normalize: boolean;
    private readonly queryPrefix: string;
    private readonly passagePrefix: string;

    constructor(options?: LocalEmbeddingProviderOptions) {
        this.modelName    = options?.modelName    ?? "Xenova/multilingual-e5-small";
        this.batchSize    = options?.batchSize    ?? Number(process.env.EMBEDDING_PROVIDER_BATCH_SIZE ?? (process.env.VERCEL ? "8" : "25"));
        this.quantized    = options?.quantized    ?? true;
        this.pooling      = options?.pooling      ?? "mean";
        this.normalize    = options?.normalize    ?? true;
        this.queryPrefix  = options?.queryPrefix  ?? "query: ";
        this.passagePrefix = options?.passagePrefix ?? "passage: ";
        this.dimensions   = options?.dimensions   ?? 384;
    }

    async init(): Promise<void> {
        if (this.initPromise) return this.initPromise;
        this.initPromise = this._init();
        return this.initPromise;
    }

    private async _init(): Promise<void> {
        const { pipeline } = await import("@xenova/transformers");
        this.extractor = await pipeline("feature-extraction", this.modelName, {
            quantized: this.quantized,
        });
    }

    private prepareText(text: string, isQuery: boolean): string {
        const clean = text.replace(/\s+/g, " ").trim();
        if (isQuery) {
            return clean.startsWith(this.queryPrefix) ? clean : `${this.queryPrefix}${clean}`;
        }
        return clean.startsWith(this.passagePrefix) ? clean : `${this.passagePrefix}${clean}`;
    }

    async embed(input: EmbedInput, isQuery = false): Promise<Float32Array> {
        await this.init();
        const text = this.prepareText(enrichEmbedInput(input), isQuery);
        const output = await this.extractor(text, {
            pooling:   this.pooling,
            normalize: this.normalize,
        });
        return output.data as Float32Array;
    }

    async embedMany<T extends { embedInput: EmbedInput }>(
        entries: T[],
        isQuery = false,
        onBatch?: (completed: number, total: number) => void,
    ): Promise<{ results: Array<{ entry: T; embedding: Float32Array }>; tokensUsed: number }> {
        await this.init();
        if (entries.length === 0) return { results: [], tokensUsed: 0 };

        const results: Array<{ entry: T; embedding: Float32Array }> = [];

        for (let i = 0; i < entries.length; i += this.batchSize) {
            const batch = entries.slice(i, i + this.batchSize);
            const texts = batch.map(e => this.prepareText(enrichEmbedInput(e.embedInput), isQuery));

            const output = await this.extractor(texts, {
                pooling:   this.pooling,
                normalize: this.normalize,
            });

            const dims = Array.isArray(output.dims) ? output.dims : [];
            const data = output.data as Float32Array;

            if (dims.length >= 2 && typeof dims[0] === "number" && typeof dims[1] === "number") {
                const [rows, cols] = dims as [number, number];
                for (let j = 0; j < rows; j++) {
                    results.push({ entry: batch[j]!, embedding: new Float32Array(data.subarray(j * cols, j * cols + cols)) });
                }
            } else {
                results.push({ entry: batch[0]!, embedding: new Float32Array(data) });
            }

            onBatch?.(Math.min(i + batch.length, entries.length), entries.length);
        }

        // Modelo local — não consome tokens de API
        return { results, tokensUsed: 0 };
    }
}
