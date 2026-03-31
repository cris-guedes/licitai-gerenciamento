import { z } from "zod"

export const ProcurementItemResultSchema = z.object({
    sequencialResultado:            z.number().optional(),
    niFornecedor:                   z.string().optional(),
    nomeRazaoSocialFornecedor:      z.string().optional(),
    tipoPessoa:                     z.string().optional(),
    porteFornecedorNome:            z.string().optional(),
    valorUnitarioHomologado:        z.number().optional(),
    valorTotalHomologado:           z.number().optional(),
    quantidadeHomologada:           z.number().optional(),
    percentualDesconto:             z.number().optional(),
    situacaoCompraItemResultadoNome: z.string().optional(),
    aplicacaoBeneficioMeEpp:        z.boolean().optional(),
    dataResultado:                  z.string().optional(),
    motivoCancelamento:             z.string().optional(),
})

export const FetchExternalProcurementItemResultsResponseSchema = z.object({
    results: z.array(ProcurementItemResultSchema),
})

export namespace FetchExternalProcurementItemResultsControllerSchemas {
    export const Headers  = z.object({ "authorization": z.string().optional() }).optional()
    export const Body     = z.null()
    export const Params   = z.null()

    export const Query = z.object({
        cnpj:       z.coerce.string().min(14).max(14),
        ano:        z.coerce.number().min(1900).max(2100),
        sequencial: z.coerce.number(),
        numeroItem: z.coerce.number(),
    })

    export const Response = FetchExternalProcurementItemResultsResponseSchema

    export type Input = z.infer<typeof Query>
}
