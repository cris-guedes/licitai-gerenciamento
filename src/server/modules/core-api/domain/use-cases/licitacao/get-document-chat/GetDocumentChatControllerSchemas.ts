import { z } from "zod";
import { DocumentChatMessageSchema, DocumentChatSchema } from "../_shared/documentChatSchemas";

const GetDocumentChatParamsSchema = z.object({
    documentId: z.string().describe("ID do documento cujo chat único será carregado."),
});

const GetDocumentChatResponseSchema = z.object({
    chat: DocumentChatSchema.describe("Metadados do chat persistente do documento."),
    messages: z.array(DocumentChatMessageSchema).describe("Mensagens persistidas do chat único do documento."),
});

export namespace GetDocumentChatControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = z.null();
    export const Query = z.null();
    export const Params = GetDocumentChatParamsSchema;
    export const Response = GetDocumentChatResponseSchema;

    export type Input = z.infer<typeof GetDocumentChatParamsSchema>;
}
