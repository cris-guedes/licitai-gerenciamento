import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { IAgent, IExtractionResult } from "@/server/modules/core-api/domain/data/IAgent";
import { EDITAL_SEARCH_QUERIES } from "./queries";
import { EDITAL_FIELD_SCHEMA } from "./schemas";
import { SYSTEM_PROMPT, buildExtractionPrompt } from "./prompts";
import { FIELD_EXTRACTOR_CONFIG } from "./config";

export class EditalFieldExtractorAgent implements IAgent<Record<string, any>[], Record<string, any>> {
    private readonly openai: ReturnType<typeof createOpenAI>;

    constructor() {
        this.openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    getSearchQueries(): string[] {
        return EDITAL_SEARCH_QUERIES;
    }

    async extract(payloads: Record<string, any>[], onProgress?: (message: string, percent: number) => void): Promise<IExtractionResult<Record<string, any>>> {
        const startTime = Date.now();
        onProgress?.("Interpretando contexto com IA...", 60);

        const context = JSON.stringify(payloads, null, 2);

        const { object, usage } = await generateObject({
            model: this.openai(FIELD_EXTRACTOR_CONFIG.model),
            schema: EDITAL_FIELD_SCHEMA,
            system: SYSTEM_PROMPT,
            prompt: buildExtractionPrompt(context),
            temperature: FIELD_EXTRACTOR_CONFIG.temperature,
        });

        console.log("\n[EditalFieldExtractorAgent] AI_RAW_RESPONSE:");
        console.log(JSON.stringify(object, null, 2));
        console.log("-------------------------------------------\n");

        const elapsedMs = Date.now() - startTime;
        console.log(`[EditalFieldExtractorAgent] Extração concluída em ${elapsedMs}ms`);

        onProgress?.("Campos do edital extraídos com sucesso", 70);

        return {
            data: object,
            metrics: {
                tokensUsed: {
                    prompt: usage?.inputTokens ?? 0,
                    completion: usage?.outputTokens ?? 0,
                    total: (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0),
                }
            }
        };
    }
}
