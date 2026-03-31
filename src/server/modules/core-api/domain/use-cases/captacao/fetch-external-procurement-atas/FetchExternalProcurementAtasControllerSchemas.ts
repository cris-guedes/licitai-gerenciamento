import { z } from "zod"

export const ProcurementAtaSchema = z.object({
    numeroAtaRegistroPreco: z.string().optional(),
    anoAta:                 z.number().optional(),
    sequencialAta:          z.number().optional(),
    numeroControlePNCP:     z.string().optional(),
    objetoCompra:           z.string().optional(),
    dataAssinatura:         z.string().optional(),
    dataVigenciaInicio:     z.string().optional(),
    dataVigenciaFim:        z.string().optional(),
    dataCancelamento:       z.string().nullable().optional(),
    cancelado:              z.boolean().optional(),
    dataPublicacaoPncp:     z.string().optional(),
})

export const FetchExternalProcurementAtasResponseSchema = z.object({
    atas: z.array(ProcurementAtaSchema),
})

export namespace FetchExternalProcurementAtasControllerSchemas {
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

    export const Response = FetchExternalProcurementAtasResponseSchema

    export type Input = z.infer<typeof Query>
}
