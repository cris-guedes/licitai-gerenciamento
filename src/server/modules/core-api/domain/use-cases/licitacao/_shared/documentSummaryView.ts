import { z } from "zod";
import type { Prisma } from "@prisma/client";
import type { DocumentChatSourceView } from "./documentChatView";

export type DocumentSummaryStructuredView = {
    overview: string;
    keyPoints: string[];
    deadlines: string[];
    requirements: string[];
    risks: string[];
};

export type DocumentSummaryView = {
    documentId: string;
    generatedAt: string;
    summary: DocumentSummaryStructuredView;
    sources: DocumentChatSourceView[];
};

const DocumentSummarySourceSchema = z.object({
    id: z.string(),
    chunkId: z.string(),
    page: z.number().nullable(),
    score: z.number(),
    snippet: z.string(),
    heading: z.string().nullable(),
    createdAt: z.string(),
});

const DocumentSummaryResultSchema = z.object({
    documentId: z.string(),
    generatedAt: z.string(),
    summary: z.object({
        overview: z.string(),
        keyPoints: z.array(z.string()),
        deadlines: z.array(z.string()),
        requirements: z.array(z.string()),
        risks: z.array(z.string()),
    }),
    sources: z.array(DocumentSummarySourceSchema),
});

export class DocumentSummaryViewMapper {
    static toView(data: DocumentSummaryView): DocumentSummaryView {
        return data;
    }

    static fromAnalysisResult(result: Prisma.JsonValue | null): DocumentSummaryView | null {
        if (!result) return null;

        const parsed = DocumentSummaryResultSchema.safeParse(result);
        if (!parsed.success) return null;

        return parsed.data;
    }

    static toMarkdownContent(summary: DocumentSummaryStructuredView): string {
        const sections = [
            "## Visão geral",
            summary.overview.trim() || "Não informado.",
            this.buildListSection("## Principais pontos", summary.keyPoints),
            this.buildListSection("## Prazos e datas críticas", summary.deadlines),
            this.buildListSection("## Requisitos relevantes", summary.requirements),
            this.buildListSection("## Pontos de atenção", summary.risks),
        ];

        return sections
            .flatMap(section => Array.isArray(section) ? section : [section])
            .filter(Boolean)
            .join("\n\n");
    }

    private static buildListSection(title: string, items: string[]) {
        if (!items.length) {
            return [title, "Nenhum item identificado."];
        }

        return [title, ...items.map(item => `- ${item}`)];
    }
}
