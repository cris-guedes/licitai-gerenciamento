/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { ExtractEditalDataPostEmbedingControllerSchemas } from "./ExtractEditalDataPostEmbedingControllerSchemas";

const ExtractEditalDataPostEmbedingStreamResponseSchema = z
    .string()
    .describe("Stream Server-Sent Events (SSE) da extração pós-embedding. Cada evento é enviado no formato `data: {...}\\n\\n`.");

export namespace ExtractEditalDataPostEmbedingStreamControllerSchemas {
    export const Headers = ExtractEditalDataPostEmbedingControllerSchemas.Headers;
    export const Body = ExtractEditalDataPostEmbedingControllerSchemas.Body;
    export const Query = ExtractEditalDataPostEmbedingControllerSchemas.Query;
    export const Params = ExtractEditalDataPostEmbedingControllerSchemas.Params;
    export const Response = ExtractEditalDataPostEmbedingStreamResponseSchema;

    export type Output = z.infer<typeof ExtractEditalDataPostEmbedingStreamResponseSchema>;
}
