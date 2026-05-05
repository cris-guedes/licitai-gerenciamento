import { z } from "zod";

export type DocumentSummaryChunkPayload = {
    chunkId: string;
    content: string;
    page: number | null;
    heading: string | null;
    score: number;
};

export const DOCUMENT_SUMMARY_SCHEMA = z.object({
    overview: z.string().describe("Visão geral objetiva do documento em um ou dois parágrafos curtos."),
    keyPoints: z.array(
        z.string().describe("Ponto principal do documento, em linguagem executiva e objetiva."),
    ).describe("Lista dos principais pontos do documento."),
    deadlines: z.array(
        z.string().describe("Prazo, data, marco temporal ou janela importante citada no documento."),
    ).describe("Prazos e datas relevantes encontrados no documento."),
    requirements: z.array(
        z.string().describe("Requisito de participação, habilitação, execução ou entrega identificado no documento."),
    ).describe("Requisitos relevantes extraídos do documento."),
    risks: z.array(
        z.string().describe("Ponto de atenção, risco operacional, restrição ou condição sensível do documento."),
    ).describe("Riscos ou pontos de atenção encontrados no documento."),
});

export type DocumentSummaryObject = z.infer<typeof DOCUMENT_SUMMARY_SCHEMA>;
