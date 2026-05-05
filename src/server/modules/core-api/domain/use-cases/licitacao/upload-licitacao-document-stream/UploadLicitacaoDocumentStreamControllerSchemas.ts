/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";

const UploadLicitacaoDocumentStreamResponseSchema = z
    .string()
    .describe("Stream SSE com eventos de progresso do upload, chunking, embeddings, indexação vetorial e conclusão do documento.");

export namespace UploadLicitacaoDocumentStreamControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = z.null();
    export const Query = z.object({
        companyId: z.string().min(1).describe("ID da empresa dona do documento enviado."),
        licitacaoId: z.string().optional().describe("ID da licitação já iniciada, quando o documento deve ser anexado a um rascunho existente."),
        editalId: z.string().optional().describe("ID do edital já criado para receber o novo documento."),
        replaceDocumentId: z.string().optional().describe("ID do documento que será substituído pelo novo upload."),
        documentType: z.enum(["EDITAL", "ANEXO", "OUTRO"]).describe("Tipo semântico do documento enviado."),
    });
    export const Params = z.null();
    export const Response = UploadLicitacaoDocumentStreamResponseSchema;

    export type QueryInput = z.infer<typeof Query>;
    export type Output = z.infer<typeof UploadLicitacaoDocumentStreamResponseSchema>;
}
