import type { ILLMProvider } from "@/server/modules/core-api/domain/data/ILLMProvider";
import { OpenAIModel } from "./openai-model";

export class OpenAILLMProvider implements ILLMProvider {
    private readonly model: OpenAIModel;

    constructor(options: OpenAILLMProvider.Options = {}) {
        this.model = new OpenAIModel({
            model: options.model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini",
            apiKey: options.apiKey,
        });
    }

    async generateText(input: ILLMProvider.GenerateTextInput): Promise<ILLMProvider.GenerateTextOutput> {
        const result = await this.model.generateText({
            system: input.systemPrompt,
            prompt: input.prompt,
            temperature: input.temperature,
        });

        return {
            text: result.text,
            metadata: {
                provider: this.model.provider,
                model: this.model.modelName,
                usage: result.usage,
            },
        };
    }
}

export namespace OpenAILLMProvider {
    export type Options = {
        model?: string;
        apiKey?: string;
    };
}
