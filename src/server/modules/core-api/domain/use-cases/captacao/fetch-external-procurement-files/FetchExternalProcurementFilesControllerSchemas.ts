import { z } from "zod"

export const ProcurementFileSchema = z.object({
    url:                 z.string().optional(),
    titulo:              z.string().optional(),
    tipoDocumentoNome:   z.string().optional(),
    sequencialDocumento: z.number().optional(),
    dataPublicacaoPncp:  z.string().optional(),
})

export const FetchProcurementFilesResponseSchema = z.object({
    files: z.array(ProcurementFileSchema),
})

export namespace FetchExternalProcurementFilesControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional()

    export const Body = z.null()

    export const Query = z.object({
        cnpj:       z.coerce.string().min(14).max(14),
        ano:        z.coerce.number().min(1900).max(2100),
        sequencial: z.coerce.number(),
    })

    export const Params = z.null()

    export const Response = FetchProcurementFilesResponseSchema

    export type Input = z.infer<typeof Query>
}
