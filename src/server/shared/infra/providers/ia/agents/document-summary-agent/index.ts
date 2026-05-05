import type { IAgent } from "@/server/modules/core-api/domain/data/IAgent";
import type { IAModel } from "@/server/modules/core-api/domain/data/IAModel";
import { StructuredExtractionAgent } from "../structured-extraction-agent";
import { DOCUMENT_SUMMARY_AGENT_CONFIG } from "./config";
import { DOCUMENT_SUMMARY_SYSTEM_PROMPT, buildDocumentSummaryPrompt } from "./prompts";
import { DOCUMENT_SUMMARY_SEARCH_QUERIES } from "./queries";
import {
    DOCUMENT_SUMMARY_SCHEMA,
    type DocumentSummaryChunkPayload,
    type DocumentSummaryObject,
} from "./schemas";

export class DocumentSummaryAgent
extends StructuredExtractionAgent<DocumentSummaryChunkPayload, DocumentSummaryObject, DocumentSummaryObject>
implements IAgent<DocumentSummaryChunkPayload[], DocumentSummaryObject> {
    constructor(model: IAModel) {
        super({
            name: "DocumentSummaryAgent",
            model,
            searchQueries: DOCUMENT_SUMMARY_SEARCH_QUERIES,
            schema: DOCUMENT_SUMMARY_SCHEMA,
            systemPrompt: DOCUMENT_SUMMARY_SYSTEM_PROMPT,
            buildPrompt: buildDocumentSummaryPrompt,
            temperature: DOCUMENT_SUMMARY_AGENT_CONFIG.temperature,
            emptyResult: {
                overview: "",
                keyPoints: [],
                deadlines: [],
                requirements: [],
                risks: [],
            },
            mapObject: object => object,
            retry: {
                maxAttempts: 2,
                temperatureStep: 0.1,
                onFailedAttempt: (error, attempt) => {
                    const message = error instanceof Error ? error.message : String(error);
                    console.warn(`[DocumentSummaryAgent] Falha na geração do resumo (tentativa ${attempt}): ${message}`);
                },
                onFailedAllAttempts: error => {
                    throw error instanceof Error ? error : new Error(String(error));
                },
            },
        });
    }
}
