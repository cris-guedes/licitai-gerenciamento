export interface ILLMProvider {
    generateText(input: ILLMProvider.GenerateTextInput): Promise<ILLMProvider.GenerateTextOutput>;
}

export namespace ILLMProvider {
    export type GenerateTextInput = {
        systemPrompt: string;
        prompt: string;
        temperature?: number;
    };

    export type GenerateTextOutput = {
        text: string;
        metadata?: unknown;
    };
}
