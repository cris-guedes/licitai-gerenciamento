import { z } from "zod"

export const ProcurementItemSchema = z.object({
    numeroItem:              z.number().optional(),
    descricao:               z.string().optional(),
    quantidade:              z.number().nullable().optional(),
    unidadeMedida:           z.string().optional(),
    valorUnitarioEstimado:   z.number().nullable().optional(),
    valorTotal:              z.number().nullable().optional(),
    materialOuServico:       z.string().optional(),     // "M" | "S"
    materialOuServicoNome:   z.string().optional(),     // "Material" | "Serviço"
    situacaoCompraItemNome:  z.string().optional(),     // "Em andamento", etc.
    criterioJulgamentoNome:  z.string().optional(),     // "Menor preço", etc.
    tipoBeneficioNome:       z.string().optional(),     // "ME/EPP", etc.
    orcamentoSigiloso:       z.boolean().optional(),
    informacaoComplementar:  z.string().nullable().optional(),
})

export const FetchProcurementItemsResponseSchema = z.object({
    items: z.array(ProcurementItemSchema),
    total: z.number(),
})

export namespace FetchExternalProcurementItemsControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional()

    export const Body = z.null()

    export const Query = z.object({
        cnpj:          z.coerce.string().min(14).max(14),
        ano:           z.coerce.number().min(1900).max(2100),
        sequencial:    z.coerce.number(),
        pagina:        z.coerce.number().int().min(1).optional(),
        tamanhoPagina: z.coerce.number().int().min(1).max(50).optional(),
    })

    export const Params = z.null()

    export const Response = FetchProcurementItemsResponseSchema

    export type Input = z.infer<typeof Query>
}
