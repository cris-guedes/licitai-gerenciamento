import { StructuredExtractionAgent } from "../structured-extraction-agent";
import type { IAModel } from "@/server/modules/core-api/domain/data/IAModel";
import { EDITAL_DRAFT_PREVIEW_AGENT_CONFIG } from "./config";
import { EDITAL_DRAFT_PREVIEW_SCHEMA, type EditalDraftPreviewAgentOutput } from "./schemas";
import {
    EDITAL_DRAFT_PREVIEW_SYSTEM_PROMPT,
    buildEditalDraftPreviewPrompt,
} from "./prompts";

type EditalDraftPreviewPayload = {
    page: number;
    content: string;
};

export class EditalDraftPreviewAgent extends StructuredExtractionAgent<
    EditalDraftPreviewPayload,
    EditalDraftPreviewAgentOutput,
    EditalDraftPreviewAgentOutput
> {
    constructor(model: IAModel) {
        super({
            name: "EditalDraftPreviewAgent",
            model,
            searchQueries: [],
            schema: EDITAL_DRAFT_PREVIEW_SCHEMA,
            systemPrompt: EDITAL_DRAFT_PREVIEW_SYSTEM_PROMPT,
            buildPrompt: buildEditalDraftPreviewPrompt,
            temperature: EDITAL_DRAFT_PREVIEW_AGENT_CONFIG.temperature,
            emptyResult: {
                displayName: null,
                orgaoNome: null,
                modalidade: null,
                numero: null,
                objetoResumo: null,
                dataAbertura: null,
            },
            mapObject: object => object,
        });
    }
}
