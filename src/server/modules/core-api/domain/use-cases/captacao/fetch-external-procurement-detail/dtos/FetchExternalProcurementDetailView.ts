export type FetchExternalProcurementDetailView = {
    numeroCompra?: string
    processo?: string
    situacaoNome?: string
    objetoCompra?: string
    informacaoComplementar?: string
    srp?: boolean
    dataAberturaProposta?: string
    dataEncerramentoProposta?: string
    dataPublicacaoPncp?: string
    valorTotal?: number
    valorTotalHomologado?: number
    orgaoCnpj?: string
    orgaoRazaoSocial?: string
    orgaoEsferaId?: string
    orgaoPoderI?: string
    unidadeCodigo?: string
    unidadeNome?: string
    municipioNome?: string
    uf?: string
    modalidadeNome?: string
    tipoInstrumentoNome?: string
    modoDisputaNome?: string
    amparoLegalNome?: string
    linkSistemaOrigem?: string
    linkProcessoEletronico?: string
    numeroControlePncp?: string
}

export class FetchExternalProcurementDetailMapper {
    static toView(data: any): FetchExternalProcurementDetailView {
        if (!data) return {}
        return {
            numeroCompra:             data.numeroCompra,
            processo:                 data.processo,
            situacaoNome:             data.situacaoCompraNome ?? data.situacaoCompraDescricao ?? data.situacaoNome,
            objetoCompra:             data.objetoCompra,
            informacaoComplementar:   data.informacaoComplementar,
            srp:                      data.srp,
            dataAberturaProposta:     data.dataAberturaProposta,
            dataEncerramentoProposta: data.dataEncerramentoProposta,
            dataPublicacaoPncp:       data.dataPublicacaoPncp,
            valorTotal:               data.valorTotalEstimado ?? data.valorTotal,
            valorTotalHomologado:     data.valorTotalHomologado,
            orgaoCnpj:                data.orgaoEntidade?.cnpj,
            orgaoRazaoSocial:         data.orgaoEntidade?.razaoSocial,
            orgaoEsferaId:            data.orgaoEntidade?.esferaId,
            orgaoPoderI:              data.orgaoEntidade?.poderId,
            unidadeCodigo:            data.unidadeOrgao?.codigoUnidade,
            unidadeNome:              data.unidadeOrgao?.nomeUnidade,
            municipioNome:            data.unidadeOrgao?.municipioNome,
            uf:                       data.unidadeOrgao?.ufSigla,
            modalidadeNome:           data.modalidadeNome,
            tipoInstrumentoNome:      data.tipoInstrumentoConvocatorioNome,
            modoDisputaNome:          data.modoDisputaNome,
            amparoLegalNome:          data.amparoLegal?.nome,
            linkSistemaOrigem:        data.linkSistemaOrigem,
            linkProcessoEletronico:   data.linkProcessoEletronico,
            numeroControlePncp:       data.numeroControlePNCP ?? data.numeroControle,
        }
    }
}
