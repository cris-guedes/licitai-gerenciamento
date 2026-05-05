import { z } from "zod";
import { ExtractEditalDataControllerSchemas } from "../extract-edital-data/ExtractEditalDataControllerSchemas";

const ExtractEditalDataPostEmbedingBodySchema = z.null();
const ExtractEditalDataPostEmbedingQuerySchema = z.object({
    companyId: z.string().describe("ID da empresa dona do documento já processado."),
    documentId: z.string().describe("ID do documento já processado e indexado para reuso na extração."),
});

export namespace ExtractEditalDataPostEmbedingControllerSchemas {
    export const Headers = ExtractEditalDataControllerSchemas.Headers;
    export const Body = ExtractEditalDataPostEmbedingBodySchema;
    export const Query = ExtractEditalDataPostEmbedingQuerySchema;
    export const Params = z.null();
    export const Response = ExtractEditalDataControllerSchemas.Response;

    export type Metrics = ExtractEditalDataControllerSchemas.Metrics;
    export type Output = ExtractEditalDataControllerSchemas.Output;
}
