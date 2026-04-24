import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { IAgent, IExtractionResult, IExtractionMetrics } from "@/server/modules/core-api/domain/data/IAgent";
import { EDITAL_ITEM_SCHEMA } from "./schemas";
import { ITEM_SEARCH_QUERIES } from "./queries";
import { ITEM_EXTRACTOR_PROMPT, buildItemExtractionPrompt } from "./prompts";
import { ITEM_EXTRACTOR_CONFIG } from "./config";

export class EditalItemExtractorAgent implements IAgent<Record<string, any>[], any[]> {
    private readonly openai: ReturnType<typeof createOpenAI>;

    constructor() {
        this.openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    getSearchQueries(): string[] {
        return ITEM_SEARCH_QUERIES;
    }

    async extract(payloads: Record<string, any>[]): Promise<IExtractionResult<any[]>> {
        if (payloads.length === 0) {
            return { data: [], metrics: this.emptyMetrics() };
        }

        const context = JSON.stringify(payloads, null, 2);

        const run = async (temperature: number) => {
            const { object, usage } = await generateObject({
                model:       this.openai(ITEM_EXTRACTOR_CONFIG.model),
                schema:      EDITAL_ITEM_SCHEMA,
                system:      ITEM_EXTRACTOR_PROMPT,
                prompt:      buildItemExtractionPrompt(context),
                temperature,
            });

            return {
                data:    object.itens ?? [],
                metrics: this.mapMetrics(usage),
            };
        };

        try {
            return await run(ITEM_EXTRACTOR_CONFIG.temperature);
        } catch (error: any) {
            console.warn(`[EditalItemExtractorAgent] Falha na extração, retentando 1x: ${error.message}`);
            try {
                return await run(ITEM_EXTRACTOR_CONFIG.temperature + 0.1);
            } catch (err2: any) {
                console.error(`[EditalItemExtractorAgent] Falha definitiva na extração: ${err2.message}`);
                return { data: [], metrics: this.emptyMetrics() };
            }
        }
    }

    private mapMetrics(usage: any): IExtractionMetrics {
        return {
            tokensUsed: {
                prompt:     usage?.inputTokens ?? 0,
                completion: usage?.outputTokens ?? 0,
                total:      (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0),
            },
        };
    }

    private emptyMetrics(): IExtractionMetrics {
        return {
            tokensUsed: { prompt: 0, completion: 0, total: 0 },
        };
    }
}
