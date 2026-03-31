import { z } from "zod"

export const AtaDetailSchema = z.object({
    numeroAtaRegistroPreco:       z.string().optional(),
    anoAta:                       z.number().optional(),
    sequencialAta:                z.number().optional(),
    numeroControlePNCP:           z.string().optional(),
    numeroControlePncpCompra:     z.string().optional(),
    objetoCompra:                 z.string().optional(),
    informacaoComplementarCompra: z.string().nullable().optional(),
    modalidadeNome:               z.string().optional(),
    dataAssinatura:               z.string().optional(),
    dataVigenciaInicio:           z.string().optional(),
    dataVigenciaFim:              z.string().optional(),
    dataCancelamento:             z.string().nullable().optional(),
    cancelado:                    z.boolean().optional(),
    dataPublicacaoPncp:           z.string().optional(),
    dataInclusao:                 z.string().optional(),
    dataAtualizacao:              z.string().optional(),
    orgaoCnpj:                    z.string().optional(),
    orgaoNome:                    z.string().optional(),
    unidadeNome:                  z.string().optional(),
    unidadeCodigo:                z.string().optional(),
    municipioNome:                z.string().optional(),
    ufSigla:                      z.string().optional(),
})

export const FetchExternalAtaDetailResponseSchema = AtaDetailSchema

export namespace FetchExternalAtaDetailControllerSchemas {
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

    export const Response = FetchExternalAtaDetailResponseSchema

    export type Input = z.infer<typeof Query>
}
