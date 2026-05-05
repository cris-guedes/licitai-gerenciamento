/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";

export const DeleteLicitacaoDocumentBodySchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa dona do documento."),
    documentId: z.string().min(1).describe("ID do documento que será excluído."),
});

export const DeleteLicitacaoDocumentResponseSchema = z.object({
    documentId: z.string().describe("ID do documento excluído."),
    deleted: z.literal(true).describe("Confirma que o documento foi removido com sucesso."),
});

export namespace DeleteLicitacaoDocumentControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = DeleteLicitacaoDocumentBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = DeleteLicitacaoDocumentResponseSchema;

    export type Input = z.infer<typeof DeleteLicitacaoDocumentBodySchema>;
}
