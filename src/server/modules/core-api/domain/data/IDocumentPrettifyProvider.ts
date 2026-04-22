export interface IPrettifyResult {
    content: string;
    metrics: {
        tokensUsed: { prompt: number; completion: number; total: number };
    };
}

export interface IDocumentPrettifyProvider {
    prettifyText(text: string): Promise<IPrettifyResult>;
    prettifyTable(tableText: string): Promise<IPrettifyResult>;
}

export namespace IDocumentPrettifyProvider {
    export const Contract = Symbol("IDocumentPrettifyProvider");
}
