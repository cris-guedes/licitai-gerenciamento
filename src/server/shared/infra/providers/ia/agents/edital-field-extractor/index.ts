import type { IAModel } from "@/server/modules/core-api/domain/data/IAModel";
import { EDITAL_SEARCH_QUERIES } from "./queries";
import { EDITAL_FIELD_SCHEMA } from "./schemas";
import { SYSTEM_PROMPT, buildExtractionPrompt } from "./prompts";
import { FIELD_EXTRACTOR_CONFIG } from "./config";
import { StructuredExtractionAgent } from "../structured-extraction-agent";

export class EditalFieldExtractorAgent extends StructuredExtractionAgent<Record<string, any>, Record<string, any>, Record<string, any>> {
    constructor(model: IAModel) {
        super({
            name: "EditalFieldExtractorAgent",
            model,
            searchQueries: EDITAL_SEARCH_QUERIES,
            schema: EDITAL_FIELD_SCHEMA,
            systemPrompt: SYSTEM_PROMPT,
            buildPrompt: buildExtractionPrompt,
            temperature: FIELD_EXTRACTOR_CONFIG.temperature,
            emptyResult: {},
            mapObject: object => object,
            logResponse: true,
        });
    }
}
