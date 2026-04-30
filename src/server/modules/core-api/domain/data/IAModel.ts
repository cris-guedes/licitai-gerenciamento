import type { ZodSchema } from "zod";

export interface IAModelUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}

export interface IAModelObjectInput<TObject> {
    schema: ZodSchema<TObject>;
    system: string;
    prompt: string;
    temperature?: number;
}

export interface IAModelTextInput {
    system: string;
    prompt: string;
    temperature?: number;
}

export interface IAModel {
    readonly provider: string;
    readonly modelName: string;

    generateObject<TObject>(input: IAModelObjectInput<TObject>): Promise<{
        object: TObject;
        usage: IAModelUsage;
    }>;

    generateText(input: IAModelTextInput): Promise<{
        text: string;
        usage: IAModelUsage;
    }>;
}

export namespace IAModel {
    export const Contract = Symbol("IAModel");
}
