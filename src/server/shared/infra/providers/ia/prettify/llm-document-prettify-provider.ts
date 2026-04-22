import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { IDocumentPrettifyProvider, IPrettifyResult } from "@/server/modules/core-api/domain/data/IDocumentPrettifyProvider";

export class LLMDocumentPrettifyProvider implements IDocumentPrettifyProvider {
    private readonly openai: ReturnType<typeof createOpenAI>;

    constructor() {
        this.openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async prettifyText(text: string): Promise<IPrettifyResult> {
        if (!text.trim()) return this.emptyResult();

        const { text: content, usage } = await generateText({
            model:  this.openai("gpt-4o-mini"),
            system: "Você é um especialista em estruturação de documentos. Sua tarefa é receber um texto de um edital de licitação e formatá-lo em Markdown (.md) limpo, preservando toda a informação original, mas melhorando a legibilidade (títulos, listas, negrito). Não adicione comentários próprios, retorne apenas o markdown.",
            prompt: `Formate o seguinte texto de edital em Markdown:\n\n${text}`,
        });

        return {
            content,
            metrics: {
                tokensUsed: {
                    prompt:     usage?.inputTokens ?? 0,
                    completion: usage?.outputTokens ?? 0,
                    total:      (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0),
                },
            },
        };
    }

    async prettifyTable(tableText: string): Promise<IPrettifyResult> {
        if (!tableText.trim()) return this.emptyResult();

        const { text: content, usage } = await generateText({
            model:  this.openai("gpt-4o-mini"),
            system: "Você é um especialista em extração de tabelas. Sua tarefa é receber um texto que representa linhas de uma tabela e formatá-lo como uma tabela Markdown (.md) válida. Preserve todas as colunas e valores originais.",
            prompt: `Converta o seguinte conteúdo de tabela em uma tabela Markdown:\n\n${tableText}`,
        });

        return {
            content,
            metrics: {
                tokensUsed: {
                    prompt:     usage?.inputTokens ?? 0,
                    completion: usage?.outputTokens ?? 0,
                    total:      (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0),
                },
            },
        };
    }

    private emptyResult(): IPrettifyResult {
        return {
            content: "",
            metrics: { tokensUsed: { prompt: 0, completion: 0, total: 0 } },
        };
    }
}
