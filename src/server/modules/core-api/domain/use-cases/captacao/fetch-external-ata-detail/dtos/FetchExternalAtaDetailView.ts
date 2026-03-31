export type FetchExternalAtaDetailView = {
    numeroAtaRegistroPreco?:        string
    anoAta?:                        number
    sequencialAta?:                 number
    numeroControlePNCP?:            string
    numeroControlePncpCompra?:      string
    objetoCompra?:                  string
    informacaoComplementarCompra?:  string
    modalidadeNome?:                string
    dataAssinatura?:                string
    dataVigenciaInicio?:            string
    dataVigenciaFim?:               string
    dataCancelamento?:              string
    cancelado?:                     boolean
    dataPublicacaoPncp?:            string
    dataInclusao?:                  string
    dataAtualizacao?:               string
    orgaoCnpj?:                     string
    orgaoNome?:                     string
    unidadeNome?:                   string
    unidadeCodigo?:                 string
    municipioNome?:                 string
    ufSigla?:                       string
}

export class FetchExternalAtaDetailMapper {
    static toView(data: any): FetchExternalAtaDetailView {
        if (!data) return {}
        return {
            numeroAtaRegistroPreco:       data.numeroAtaRegistroPreco,
            anoAta:                       data.anoAta,
            sequencialAta:                data.sequencialAta,
            numeroControlePNCP:           data.numeroControlePNCP,
            numeroControlePncpCompra:     data.numeroControlePncpCompra,
            objetoCompra:                 data.objetoCompra,
            informacaoComplementarCompra: data.informacaoComplementarCompra,
            modalidadeNome:               data.modalidadeNome,
            dataAssinatura:               data.dataAssinatura,
            dataVigenciaInicio:           data.dataVigenciaInicio,
            dataVigenciaFim:              data.dataVigenciaFim,
            dataCancelamento:             data.dataCancelamento,
            cancelado:                    data.cancelado,
            dataPublicacaoPncp:           data.dataPublicacaoPncp,
            dataInclusao:                 data.dataInclusao,
            dataAtualizacao:              data.dataAtualizacao,
            orgaoCnpj:                    data.orgaoEntidade?.cnpj,
            orgaoNome:                    data.orgaoEntidade?.razaoSocial,
            unidadeNome:                  data.unidadeOrgao?.nomeUnidade,
            unidadeCodigo:                data.unidadeOrgao?.codigoUnidade,
            municipioNome:                data.unidadeOrgao?.municipioNome,
            ufSigla:                      data.unidadeOrgao?.ufSigla,
        }
    }
}
