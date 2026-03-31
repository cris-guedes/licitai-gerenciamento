import { z } from "zod"

export const ContractTermSchema = z.object({
    sequencialTermoContrato:   z.number().optional(),
    numeroTermoContrato:       z.string().optional(),
    tipoTermoContratoNome:     z.string().optional(),
    dataAssinatura:            z.string().optional(),
    dataVigenciaInicio:        z.string().optional(),
    dataVigenciaFim:           z.string().optional(),
    dataPublicacaoPncp:        z.string().optional(),
    niFornecedor:              z.string().optional(),
    nomeRazaoSocialFornecedor: z.string().optional(),
    objetoTermoContrato:       z.string().optional(),
    valorGlobal:               z.number().nullable().optional(),
    valorAcrescido:            z.number().nullable().optional(),
    valorParcela:              z.number().nullable().optional(),
    numeroParcelas:            z.number().optional(),
    prazoAditadoDias:          z.number().optional(),
    informacaoComplementar:    z.string().nullable().optional(),
    informativoObservacao:     z.string().nullable().optional(),
    fundamentoLegal:           z.string().nullable().optional(),
})

export const FetchExternalContractTermsResponseSchema = z.object({
    terms: z.array(ContractTermSchema),
})

export namespace FetchExternalContractTermsControllerSchemas {
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

    export const Response = FetchExternalContractTermsResponseSchema

    export type Input = z.infer<typeof Query>
}
