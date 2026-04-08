import { z } from "zod";

const ExtractEditalDataBodySchema = z.object({
    pdfUrl: z
        .string()
        .url("pdfUrl deve ser uma URL válida")
        .describe("URL pública do PDF do edital a ser convertido para Markdown"),
});

const ExtractEditalDataMetricsSchema = z.object({
    sessionId:          z.string(),
    timestamp:          z.string(),
    pdfUrl:             z.string(),
    pdfFileSizeBytes:   z.number(),
    conversionTimeMs:   z.number(),
    totalTimeMs:        z.number(),
    mdFileSizeBytes:    z.number(),
    mdWordCount:        z.number(),
    doclingFilename:    z.string(),
    tempDir:            z.string(),
});

const ExtractEditalDataResponseSchema = z.object({
    sessionId:  z.string(),
    mdContent:  z.string(),
    metrics:    ExtractEditalDataMetricsSchema,
});

export namespace ExtractEditalDataControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body    = ExtractEditalDataBodySchema;
    export const Query   = z.null();
    export const Params  = z.null();
    export const Response = ExtractEditalDataResponseSchema;

    export type Input    = z.infer<typeof ExtractEditalDataBodySchema>;
    export type Metrics  = z.infer<typeof ExtractEditalDataMetricsSchema>;
    export type Output   = z.infer<typeof ExtractEditalDataResponseSchema>;
}
