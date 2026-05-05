import { z } from "zod";
import { DocumentChatMessageSchema, DocumentChatSchema } from "../_shared/documentChatSchemas";

const AskDocumentChatParamsSchema = z.object({
    documentId: z.string().describe("ID do documento dono do chat único."),
});

const AskDocumentChatBodySchema = z.object({
    message: z.string().min(1).describe("Pergunta do usuário enviada ao chat do documento."),
});

const AskDocumentChatResponseSchema = z.object({
    chat: DocumentChatSchema.describe("Metadados do chat persistente do documento."),
    userMessage: DocumentChatMessageSchema.describe("Mensagem do usuário persistida no histórico."),
    assistantMessage: DocumentChatMessageSchema.describe("Resposta gerada pela IA com suas fontes."),
});

export namespace AskDocumentChatControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = AskDocumentChatBodySchema;
    export const Query = z.null();
    export const Params = AskDocumentChatParamsSchema;
    export const Response = AskDocumentChatResponseSchema;

    export type Input = z.infer<typeof AskDocumentChatBodySchema> & z.infer<typeof AskDocumentChatParamsSchema>;
}
