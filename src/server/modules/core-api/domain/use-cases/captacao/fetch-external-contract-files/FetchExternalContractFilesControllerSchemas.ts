import { z } from "zod"

export const ContractFileSchema = z.object({
    url:                 z.string().optional(),
    titulo:              z.string().optional(),
    tipoDocumentoNome:   z.string().optional(),
    sequencialDocumento: z.number().optional(),
    dataPublicacaoPncp:  z.string().optional(),
})

export const FetchExternalContractFilesResponseSchema = z.object({
    files: z.array(ContractFileSchema),
})

export namespace FetchExternalContractFilesControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional()

    export const Body = z.null()

    export const Query = z.object({
        cnpj:               z.coerce.string().min(14).max(14),
        anoContrato:        z.coerce.number().min(1900).max(2100),
        sequencialContrato: z.coerce.number(),
    })

    export const Params = z.null()

    export const Response = FetchExternalContractFilesResponseSchema

    export type Input = z.infer<typeof Query>
}
