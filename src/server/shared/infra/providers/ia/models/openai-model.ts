import { generateObject, generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { IAModel, IAModelObjectInput, IAModelTextInput, IAModelUsage } from "@/server/modules/core-api/domain/data/IAModel";

export interface OpenAIModelOptions {
    model: string;
    apiKey?: string;
}

export class OpenAIModel implements IAModel {
    readonly provider = "openai";
    readonly modelName: string;

    private readonly client: ReturnType<typeof createOpenAI>;

    constructor(options: OpenAIModelOptions) {
        this.modelName = options.model;
        this.client = createOpenAI({
            apiKey: options.apiKey ?? process.env.OPENAI_API_KEY,
        });
    }

    async generateObject<TObject>(input: IAModelObjectInput<TObject>) {
        const { object, usage } = await generateObject({
            model: this.client(this.modelName),
            schema: input.schema,
            system: input.system,
            prompt: input.prompt,
            temperature: input.temperature,
        });

        return {
            object,
            usage: this.mapUsage(usage),
        };
    }

    async generateText(input: IAModelTextInput) {
        const { text, usage } = await generateText({
            model: this.client(this.modelName),
            system: input.system,
            prompt: input.prompt,
            temperature: input.temperature,
        });

        return {
            text,
            usage: this.mapUsage(usage),
        };
    }

    private mapUsage(usage: any): IAModelUsage {
        const promptTokens = usage?.inputTokens ?? 0;
        const completionTokens = usage?.outputTokens ?? 0;

        return {
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens,
        };
    }
}
