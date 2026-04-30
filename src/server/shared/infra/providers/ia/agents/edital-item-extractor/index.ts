import type { IAModel } from "@/server/modules/core-api/domain/data/IAModel";
import { EDITAL_ITEM_SCHEMA } from "./schemas";
import { ITEM_SEARCH_QUERIES } from "./queries";
import { ITEM_EXTRACTOR_PROMPT, buildItemExtractionPrompt } from "./prompts";
import { ITEM_EXTRACTOR_CONFIG } from "./config";
import { StructuredExtractionAgent } from "../structured-extraction-agent";

export class EditalItemExtractorAgent extends StructuredExtractionAgent<Record<string, any>, { itens?: any[] }, any[]> {
    constructor(model: IAModel) {
        super({
            name: "EditalItemExtractorAgent",
            model,
            searchQueries: ITEM_SEARCH_QUERIES,
            schema: EDITAL_ITEM_SCHEMA,
            systemPrompt: ITEM_EXTRACTOR_PROMPT,
            buildPrompt: buildItemExtractionPrompt,
            temperature: ITEM_EXTRACTOR_CONFIG.temperature,
            emptyResult: [],
            mapObject: object => object.itens ?? [],
            retry: {
                maxAttempts: 2,
                temperatureStep: 0.1,
                onFailedAttempt: (error, attempt) => {
                    const message = error instanceof Error ? error.message : String(error);
                    if (attempt < 2) {
                        console.warn(`[EditalItemExtractorAgent] Falha na extração, retentando 1x: ${message}`);
                    }
                },
                onFailedAllAttempts: error => {
                    const message = error instanceof Error ? error.message : String(error);
                    console.error(`[EditalItemExtractorAgent] Falha definitiva na extração: ${message}`);
                    return [];
                },
            },
        });
    }
}
