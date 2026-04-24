/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { ExtractEditalDataControllerSchemas } from "./ExtractEditalDataControllerSchemas";

const ExtractEditalDataStreamResponseSchema = z
    .string()
    .describe("Stream Server-Sent Events (SSE). Cada evento e enviado no formato `data: {...}\\n\\n`, incluindo progresso, respostas parciais e o evento final.");

export namespace ExtractEditalDataStreamControllerSchemas {
    export const Headers = ExtractEditalDataControllerSchemas.Headers;
    export const Body = ExtractEditalDataControllerSchemas.Body;
    export const Query = ExtractEditalDataControllerSchemas.Query;
    export const Params = ExtractEditalDataControllerSchemas.Params;
    export const Response = ExtractEditalDataStreamResponseSchema;

    export type Output = z.infer<typeof ExtractEditalDataStreamResponseSchema>;
}
