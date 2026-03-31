import { z } from "zod"

export const ProcurementContractSchema = z.object({
    numeroContratoEmpenho:     z.string().optional(),
    anoContrato:               z.number().optional(),
    sequencialContrato:        z.number().optional(),
    numeroControlePNCP:        z.string().optional(),
    objetoContrato:            z.string().optional(),
    niFornecedor:              z.string().optional(),
    nomeRazaoSocialFornecedor: z.string().optional(),
    tipoPessoa:                z.string().optional(),
    dataAssinatura:            z.string().optional(),
    dataVigenciaInicio:        z.string().optional(),
    dataVigenciaFim:           z.string().optional(),
    dataPublicacaoPncp:        z.string().optional(),
    valorInicial:              z.number().nullable().optional(),
    valorGlobal:               z.number().nullable().optional(),
    valorAcumulado:            z.number().nullable().optional(),
    tipoContratoNome:          z.string().optional(),
    informacaoComplementar:    z.string().nullable().optional(),
})

export const FetchExternalProcurementContractsResponseSchema = z.object({
    contracts: z.array(ProcurementContractSchema),
})

export namespace FetchExternalProcurementContractsControllerSchemas {
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

    export const Response = FetchExternalProcurementContractsResponseSchema

    export type Input = z.infer<typeof Query>
}
