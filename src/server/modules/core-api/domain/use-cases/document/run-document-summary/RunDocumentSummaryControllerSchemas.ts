import { z } from "zod";

const AnalysisResponseSchema = z.object({
    id:         z.string(),
    orgId:      z.string(),
    companyId:  z.string(),
    documentId: z.string(),
    version:    z.number(),
    status:     z.string(),
    model:      z.string().nullable(),
    summary:    z.string().nullable(),
    createdAt:  z.string(),
    updatedAt:  z.string(),
});

const RunDocumentSummaryBodySchema = z.object({
    orgId:      z.string().describe("ID da organização"),
    companyId:  z.string().describe("ID da empresa"),
    documentId: z.string().describe("ID do documento a resumir"),
});

export namespace RunDocumentSummaryControllerSchemas {
    export const Body     = RunDocumentSummaryBodySchema;
    export const Query    = z.null();
    export const Params   = z.null();
    export const Response = AnalysisResponseSchema;

    export type Input = z.infer<typeof Body>;
}

export { AnalysisResponseSchema };
