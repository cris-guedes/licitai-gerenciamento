import { z } from "zod"

export const AtaFileSchema = z.object({
    url:                 z.string().optional(),
    titulo:              z.string().optional(),
    tipoDocumentoNome:   z.string().optional(),
    sequencialDocumento: z.number().optional(),
    dataPublicacaoPncp:  z.string().optional(),
})

export const FetchExternalAtaFilesResponseSchema = z.object({
    files: z.array(AtaFileSchema),
})

export namespace FetchExternalAtaFilesControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional()

    export const Body = z.null()

    export const Query = z.object({
        cnpj:             z.coerce.string().min(14).max(14),
        anoCompra:        z.coerce.number().min(1900).max(2100),
        sequencialCompra: z.coerce.number(),
        sequencialAta:    z.coerce.number(),
    })

    export const Params = z.null()

    export const Response = FetchExternalAtaFilesResponseSchema

    export type Input = z.infer<typeof Query>
}
