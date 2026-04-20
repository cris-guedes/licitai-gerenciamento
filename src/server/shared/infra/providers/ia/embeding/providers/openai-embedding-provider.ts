import { embedMany as aiEmbedMany } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { IEmbeddingProvider, EmbedInput } from "@/server/modules/core-api/domain/data/IEmbeddingProvider";
import { enrichEmbedInput } from "@/server/modules/core-api/domain/data/IEmbeddingProvider";

export interface OpenAIEmbeddingProviderOptions {
    /** Modelo de embedding da OpenAI. Default: "text-embedding-3-small" */
    model?: string;
    /** Máximo de textos por chamada à API. Default: 2048 (limite da OpenAI). */
    batchSize?: number;
    /**
     * Máximo de chamadas paralelas simultâneas. Default: 1 (sequencial).
     * O número real de chamadas paralelas é calculado automaticamente
     * com base na quantidade de batches — este valor é apenas o teto.
     */
    /** Máximo de chamadas paralelas simultâneas. Default: 1 (sequencial). */
    maxConcurrency?: number;
    /** Dimensão manual dos vetores. Se omitido, é inferido do modelo. */
    dimensions?: number;
}

type EmbedPlan = {
    totalEntries:   number;
    totalBatches:   number;
    batchSize:      number;
    effectiveConcurrency: number; // min(totalBatches, maxConcurrency)
};

/**
 * Provider de embedding usando a API de embeddings da OpenAI.
 */
export class OpenAIEmbeddingProvider implements IEmbeddingProvider {
    readonly modelName: string;
    readonly dimensions: number;
    private readonly batchSize: number;
    private readonly maxConcurrency: number;
    private readonly client: ReturnType<typeof createOpenAI>;

    constructor(options?: OpenAIEmbeddingProviderOptions) {
        this.modelName      = options?.model          ?? "text-embedding-3-small";
        this.batchSize      = options?.batchSize      ?? 2048;
        this.maxConcurrency = options?.maxConcurrency ?? 1;
        this.client         = createOpenAI();

        // Inferencia de dimensões se não houver override
        if (options?.dimensions) {
            this.dimensions = options.dimensions;
        } else {
            this.dimensions = this.modelName.includes("large") ? 3072 : 1536;
        }
    }

    private embeddingModel() {
        return this.client.embedding(this.modelName);
    }

    /** Calcula e loga o plano de execução para o lote de entradas. */
    private planBatches<T>(entries: T[]): { batches: T[][]; plan: EmbedPlan } {
        const batches: T[][] = [];
        for (let i = 0; i < entries.length; i += this.batchSize) {
            batches.push(entries.slice(i, i + this.batchSize));
        }

        const plan: EmbedPlan = {
            totalEntries:        entries.length,
            totalBatches:        batches.length,
            batchSize:           this.batchSize,
            effectiveConcurrency: Math.min(batches.length, this.maxConcurrency),
        };

        const mode = plan.effectiveConcurrency > 1
            ? `${plan.effectiveConcurrency} paralelas`
            : "sequencial";
        console.log(
            `[OpenAIEmbedding] ${plan.totalEntries} chunks → ${plan.totalBatches} batch(es) × ${plan.batchSize} | concorrência: ${mode}`
        );

        return { batches, plan };
    }

    async embed(input: EmbedInput, _isQuery?: boolean): Promise<Float32Array> {
        const { embeddings } = await aiEmbedMany({
            model:  this.embeddingModel(),
            values: [enrichEmbedInput(input)],
        });
        return new Float32Array(embeddings[0]);
    }

    async embedMany<T extends { embedInput: EmbedInput }>(
        entries: T[],
        _isQuery?: boolean,
        onBatch?: (completed: number, total: number) => void,
    ): Promise<{ results: Array<{ entry: T; embedding: Float32Array }>; tokensUsed: number }> {
        if (entries.length === 0) return { results: [], tokensUsed: 0 };

        const { batches, plan } = this.planBatches(entries);
        const results: Array<{ entry: T; embedding: Float32Array }> = new Array(entries.length);
        let completed = 0;
        let tokensUsed = 0;

        const embedBatch = (batch: T[]) =>
            aiEmbedMany({
                model:  this.embeddingModel(),
                values: batch.map(e => enrichEmbedInput(e.embedInput)),
            }).then(({ embeddings, usage }) => ({
                items: batch.map((entry, j) => ({ entry, embedding: new Float32Array(embeddings[j]!) })),
                tokens: usage?.tokens ?? 0,
            }));

        for (let i = 0; i < batches.length; i += plan.effectiveConcurrency) {
            const window = batches.slice(i, i + plan.effectiveConcurrency);
            const windowResults = await Promise.all(window.map(embedBatch));

            for (const { items, tokens } of windowResults) {
                tokensUsed += tokens;
                for (const item of items) {
                    results[completed++] = item;
                }
                onBatch?.(completed, entries.length);
            }
        }

        return { results, tokensUsed };
    }
}
