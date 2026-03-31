import { z } from "zod"

export const ProcurementHistoryEntrySchema = z.object({
    dataInclusao:              z.string().optional(),
    tipoLogManutencaoNome:     z.string().optional(),
    categoriaLogManutencaoNome: z.string().optional(),
    justificativa:             z.string().optional(),
    usuarioNome:               z.string().optional(),
    documentoTipo:             z.string().optional(),
    documentoTitulo:           z.string().optional(),
    itemNumero:                z.number().optional(),
})

export const FetchExternalProcurementHistoryResponseSchema = z.object({
    entries: z.array(ProcurementHistoryEntrySchema),
})

export namespace FetchExternalProcurementHistoryControllerSchemas {
    export const Headers  = z.object({ "authorization": z.string().optional() }).optional()
    export const Body     = z.null()
    export const Params   = z.null()

    export const Query = z.object({
        cnpj:       z.coerce.string().min(14).max(14),
        ano:        z.coerce.number().min(1900).max(2100),
        sequencial: z.coerce.number(),
    })

    export const Response = FetchExternalProcurementHistoryResponseSchema

    export type Input = z.infer<typeof Query>
}
