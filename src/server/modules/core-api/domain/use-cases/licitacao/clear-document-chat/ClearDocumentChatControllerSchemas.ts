import { z } from "zod";

const ClearDocumentChatParamsSchema = z.object({
    documentId: z.string().describe("ID do documento cujo chat será limpo."),
});

const ClearDocumentChatResponseSchema = z.object({
    chatId: z.string().describe("ID do chat único do documento."),
    cleared: z.literal(true).describe("Indica que o histórico foi limpo com sucesso."),
});

export namespace ClearDocumentChatControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = z.null();
    export const Query = z.null();
    export const Params = ClearDocumentChatParamsSchema;
    export const Response = ClearDocumentChatResponseSchema;

    export type Input = z.infer<typeof ClearDocumentChatParamsSchema>;
}
