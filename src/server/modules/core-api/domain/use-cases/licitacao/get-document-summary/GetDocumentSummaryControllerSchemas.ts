import { z } from "zod";
import { SummarizeDocumentControllerSchemas } from "../summarize-document/SummarizeDocumentControllerSchemas";

const GetDocumentSummaryParamsSchema = z.object({
    documentId: z.string().describe("ID do documento cujo resumo salvo será consultado."),
});

export namespace GetDocumentSummaryControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = z.null();
    export const Query = z.null();
    export const Params = GetDocumentSummaryParamsSchema;
    export const Response = z.union([
        SummarizeDocumentControllerSchemas.Response,
        z.null(),
    ]);
}
