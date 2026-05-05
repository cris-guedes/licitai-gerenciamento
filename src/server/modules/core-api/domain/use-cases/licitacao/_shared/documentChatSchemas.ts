import { z } from "zod";

export const DocumentChatSourceSchema = z.object({
    id: z.string().describe("ID da fonte associada à resposta."),
    chunkId: z.string().describe("ID do chunk recuperado no Qdrant."),
    page: z.number().nullable().describe("Página do documento em que o trecho foi encontrado."),
    score: z.number().describe("Score de similaridade retornado pela busca vetorial."),
    snippet: z.string().describe("Trecho curto usado como evidência para a resposta."),
    heading: z.string().nullable().describe("Título, seção ou heading associado ao trecho."),
    createdAt: z.string().describe("Data ISO em que a fonte foi registrada."),
});

export const DocumentChatMessageSchema = z.object({
    id: z.string().describe("ID da mensagem persistida."),
    role: z.enum(["user", "assistant", "system"]).describe("Papel da mensagem no histórico do chat."),
    content: z.string().describe("Conteúdo textual completo da mensagem."),
    metadata: z.unknown().nullable().describe("Metadados opcionais associados à mensagem."),
    createdAt: z.string().describe("Data ISO de criação da mensagem."),
    sources: z.array(DocumentChatSourceSchema).describe("Fontes RAG associadas à mensagem."),
});

export const DocumentChatSchema = z.object({
    id: z.string().describe("ID do chat persistente do documento."),
    documentId: z.string().describe("ID do documento dono do chat."),
    organizationId: z.string().describe("ID da organização dona do documento."),
    title: z.string().nullable().describe("Título opcional do chat do documento."),
    createdAt: z.string().describe("Data ISO em que o chat foi criado."),
    updatedAt: z.string().describe("Data ISO da última atualização do chat."),
});
