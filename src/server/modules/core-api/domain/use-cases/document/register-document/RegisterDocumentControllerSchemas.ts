import { z } from "zod";

const DocumentResponseSchema = z.object({
    id:          z.string(),
    orgId:       z.string(),
    companyId:   z.string(),
    editalId:    z.string(),
    type:        z.string(),
    url:         z.string(),
    publishedAt: z.string().nullable(),
    createdAt:   z.string(),
});

const RegisterDocumentBodySchema = z.object({
    orgId:       z.string().describe("ID da organização"),
    companyId:   z.string().describe("ID da empresa"),
    editalId:    z.string().describe("ID do edital ao qual o documento pertence"),
    type:        z.string().describe("Tipo do documento: edital | annex | minute | contract | other"),
    url:         z.string().url().describe("URL pública do documento PDF"),
    publishedAt: z.string().optional().nullable().describe("Data de publicação (ISO 8601)"),
});

export namespace RegisterDocumentControllerSchemas {
    export const Body     = RegisterDocumentBodySchema;
    export const Query    = z.null();
    export const Params   = z.null();
    export const Response = DocumentResponseSchema;

    export type Input = z.infer<typeof Body>;
}

export { DocumentResponseSchema };
