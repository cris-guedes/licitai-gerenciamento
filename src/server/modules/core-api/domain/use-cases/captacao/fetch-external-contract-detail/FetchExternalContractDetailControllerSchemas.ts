import { z } from "zod"

export const ContractDetailSchema = z.object({
    numeroContratoEmpenho:     z.string().optional(),
    numeroControlePNCP:        z.string().optional(),
    numeroControlePncpCompra:  z.string().optional(),
    sequencialContrato:        z.number().optional(),
    anoContrato:               z.number().optional(),
    processo:                  z.string().optional(),
    objetoContrato:            z.string().optional(),
    tipoContratoNome:          z.string().optional(),
    categoriaNome:             z.string().optional(),
    niFornecedor:              z.string().optional(),
    nomeRazaoSocialFornecedor: z.string().optional(),
    tipoPessoa:                z.string().optional(),
    dataAssinatura:            z.string().optional(),
    dataVigenciaInicio:        z.string().optional(),
    dataVigenciaFim:           z.string().optional(),
    dataPublicacaoPncp:        z.string().optional(),
    dataAtualizacao:           z.string().optional(),
    valorInicial:              z.number().nullable().optional(),
    valorGlobal:               z.number().nullable().optional(),
    valorAcumulado:            z.number().nullable().optional(),
    valorParcela:              z.number().nullable().optional(),
    numeroParcelas:            z.number().optional(),
    numeroRetificacao:         z.number().optional(),
    receita:                   z.boolean().optional(),
    informacaoComplementar:    z.string().nullable().optional(),
    orgaoCnpj:                 z.string().optional(),
    orgaoNome:                 z.string().optional(),
    unidadeNome:               z.string().optional(),
    unidadeCodigo:             z.string().optional(),
    municipioNome:             z.string().optional(),
    ufSigla:                   z.string().optional(),
})

export const FetchExternalContractDetailResponseSchema = ContractDetailSchema

export namespace FetchExternalContractDetailControllerSchemas {
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

    export const Response = FetchExternalContractDetailResponseSchema

    export type Input = z.infer<typeof Query>
}
