import { z } from "zod";
import { DocumentResponseSchema } from "../register-document/RegisterDocumentControllerSchemas";

const FileSchema = z.object({
    name:   z.string(),
    type:   z.string(),
    size:   z.number(),
    buffer: z.instanceof(Buffer),
});

const UploadDocumentBodySchema = z.object({
    orgId:       z.string().describe("ID da organização"),
    companyId:   z.string().describe("ID da empresa"),
    editalId:    z.string().describe("ID do edital ao qual o documento pertence"),
    type:        z.string().describe("Tipo do documento: edital | annex | minute | contract | other"),
    publishedAt: z.string().optional().nullable().describe("Data de publicação (ISO 8601)"),
    file:        FileSchema.describe("Arquivo PDF"),
});

export namespace UploadDocumentControllerSchemas {
    export const Body     = UploadDocumentBodySchema;
    export const Query    = z.null();
    export const Params   = z.null();
    export const Response = DocumentResponseSchema;

    export type Input = z.infer<typeof Body>;
}
