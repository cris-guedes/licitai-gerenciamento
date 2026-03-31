import { z } from "zod"

export const ContractHistoryEntrySchema = z.object({
    dataInclusao:              z.string().optional(),
    tipoLogManutencaoNome:     z.string().optional(),
    categoriaLogManutencaoNome: z.string().optional(),
    justificativa:             z.string().optional(),
    usuarioNome:               z.string().optional(),
})

export const FetchExternalContractHistoryResponseSchema = z.object({
    entries: z.array(ContractHistoryEntrySchema),
})

export namespace FetchExternalContractHistoryControllerSchemas {
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

    export const Response = FetchExternalContractHistoryResponseSchema

    export type Input = z.infer<typeof Query>
}
