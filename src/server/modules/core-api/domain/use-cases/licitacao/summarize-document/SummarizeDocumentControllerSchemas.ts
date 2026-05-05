import { z } from "zod";
import { DocumentChatSourceSchema } from "../_shared/documentChatSchemas";

const SummarizeDocumentParamsSchema = z.object({
    documentId: z.string().describe("ID do documento que será resumido pelas ferramentas de IA."),
});

const DocumentSummaryStructuredSchema = z.object({
    overview: z.string().describe("Visão geral executiva do documento."),
    keyPoints: z.array(z.string()).describe("Principais pontos identificados no documento."),
    deadlines: z.array(z.string()).describe("Prazos e datas relevantes encontrados no documento."),
    requirements: z.array(z.string()).describe("Requisitos importantes de participação, habilitação ou execução."),
    risks: z.array(z.string()).describe("Riscos, restrições ou pontos de atenção relevantes."),
});

const SummarizeDocumentResponseSchema = z.object({
    documentId: z.string().describe("ID do documento resumido."),
    generatedAt: z.string().describe("Data ISO em que o resumo foi gerado."),
    summary: DocumentSummaryStructuredSchema.describe("Resumo estruturado gerado pela IA."),
    sources: z.array(DocumentChatSourceSchema).describe("Fontes recuperadas para fundamentar o resumo."),
});

export namespace SummarizeDocumentControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = z.null();
    export const Query = z.null();
    export const Params = SummarizeDocumentParamsSchema;
    export const Response = SummarizeDocumentResponseSchema;

    export type Input = z.infer<typeof SummarizeDocumentParamsSchema>;
}
