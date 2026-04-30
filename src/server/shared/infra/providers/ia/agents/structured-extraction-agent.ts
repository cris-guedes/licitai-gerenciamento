import type { IAgent, IExtractionMetrics, IExtractionResult } from "@/server/modules/core-api/domain/data/IAgent";
import type { IAModel } from "@/server/modules/core-api/domain/data/IAModel";
import type { ZodSchema } from "zod";

export interface StructuredExtractionAgentOptions<TPayload extends Record<string, any>, TObject, TResult> {
    name: string;
    model: IAModel;
    searchQueries: string[];
    schema: ZodSchema<TObject>;
    systemPrompt: string;
    buildPrompt: (context: string) => string;
    temperature: number;
    emptyResult: TResult;
    mapObject: (object: TObject) => TResult;
    retry?: {
        maxAttempts: number;
        temperatureStep?: number;
        onFailedAttempt?: (error: unknown, attempt: number) => void;
        onFailedAllAttempts?: (error: unknown) => TResult;
    };
    logResponse?: boolean;
}

export class StructuredExtractionAgent<TPayload extends Record<string, any>, TObject, TResult>
implements IAgent<TPayload[], TResult> {
    constructor(
        private readonly options: StructuredExtractionAgentOptions<TPayload, TObject, TResult>,
    ) { }

    getSearchQueries(): string[] {
        return this.options.searchQueries;
    }

    async extract(payloads: TPayload[]): Promise<IExtractionResult<TResult>> {
        if (payloads.length === 0) {
            return { data: this.options.emptyResult, metrics: this.emptyMetrics() };
        }

        const context = JSON.stringify(payloads, null, 2);
        const retry = this.options.retry;
        const attempts = Math.max(retry?.maxAttempts ?? 1, 1);
        const temperatureStep = retry?.temperatureStep ?? 0;
        let lastError: unknown;

        for (let attempt = 1; attempt <= attempts; attempt++) {
            try {
                const { object, usage } = await this.options.model.generateObject({
                    schema: this.options.schema,
                    system: this.options.systemPrompt,
                    prompt: this.options.buildPrompt(context),
                    temperature: this.options.temperature + ((attempt - 1) * temperatureStep),
                });

                if (this.options.logResponse) {
                    console.log(`\n[${this.options.name}] AI_RAW_RESPONSE:`);
                    console.log(JSON.stringify(object, null, 2));
                    console.log("-------------------------------------------\n");
                }

                return {
                    data: this.options.mapObject(object),
                    metrics: this.mapMetrics(usage),
                };
            } catch (error) {
                lastError = error;
                retry?.onFailedAttempt?.(error, attempt);
            }
        }

        return {
            data: retry?.onFailedAllAttempts?.(lastError) ?? this.options.emptyResult,
            metrics: this.emptyMetrics(),
        };
    }

    private mapMetrics(usage: IAModelUsageLike): IExtractionMetrics {
        return {
            tokensUsed: {
                prompt: usage.promptTokens,
                completion: usage.completionTokens,
                total: usage.totalTokens,
            },
        };
    }

    private emptyMetrics(): IExtractionMetrics {
        return {
            tokensUsed: { prompt: 0, completion: 0, total: 0 },
        };
    }
}

type IAModelUsageLike = {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
};
