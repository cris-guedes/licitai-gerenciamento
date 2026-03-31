import { z } from "zod"

export const ProcurementDetailSchema = z.object({
    numeroCompra:             z.string().optional(),
    processo:                 z.string().optional(),
    situacaoNome:             z.string().optional(),
    objetoCompra:             z.string().optional(),
    informacaoComplementar:   z.string().nullable().optional(),
    srp:                      z.boolean().optional(),
    dataAberturaProposta:     z.string().optional(),
    dataEncerramentoProposta: z.string().optional(),
    dataPublicacaoPncp:       z.string().optional(),
    valorTotal:               z.number().nullable().optional(),
    valorTotalHomologado:     z.number().nullable().optional(),
    orgaoCnpj:                z.string().optional(),
    orgaoRazaoSocial:         z.string().optional(),
    orgaoEsferaId:            z.string().optional(),
    orgaoPoderI:              z.string().optional(),
    unidadeCodigo:            z.string().optional(),
    unidadeNome:              z.string().optional(),
    municipioNome:            z.string().optional(),
    uf:                       z.string().optional(),
    modalidadeNome:           z.string().optional(),
    tipoInstrumentoNome:      z.string().optional(),
    modoDisputaNome:          z.string().optional(),
    amparoLegalNome:          z.string().optional(),
    linkSistemaOrigem:        z.string().nullable().optional(),
    linkProcessoEletronico:   z.string().nullable().optional(),
    numeroControlePncp:       z.string().optional(),
})

export namespace FetchExternalProcurementDetailControllerSchemas {
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

    export const Response = ProcurementDetailSchema

    export type Input = z.infer<typeof Query>
}
