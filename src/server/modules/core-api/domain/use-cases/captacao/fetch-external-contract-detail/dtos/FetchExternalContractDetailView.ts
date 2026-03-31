export type FetchExternalContractDetailView = {
    numeroContratoEmpenho?:    string
    numeroControlePNCP?:       string
    numeroControlePncpCompra?: string
    sequencialContrato?:       number
    anoContrato?:              number
    processo?:                 string
    objetoContrato?:           string
    tipoContratoNome?:         string
    categoriaNome?:            string
    niFornecedor?:             string
    nomeRazaoSocialFornecedor?: string
    tipoPessoa?:               string
    dataAssinatura?:           string
    dataVigenciaInicio?:       string
    dataVigenciaFim?:          string
    dataPublicacaoPncp?:       string
    dataAtualizacao?:          string
    valorInicial?:             number
    valorGlobal?:              number
    valorAcumulado?:           number
    valorParcela?:             number
    numeroParcelas?:           number
    numeroRetificacao?:        number
    receita?:                  boolean
    informacaoComplementar?:   string
    orgaoCnpj?:                string
    orgaoNome?:                string
    unidadeNome?:              string
    unidadeCodigo?:            string
    municipioNome?:            string
    ufSigla?:                  string
}

export class FetchExternalContractDetailMapper {
    static toView(data: any): FetchExternalContractDetailView {
        return {
            numeroContratoEmpenho:     data.numeroContratoEmpenho,
            numeroControlePNCP:        data.numeroControlePNCP,
            numeroControlePncpCompra:  data.numeroControlePncpCompra,
            sequencialContrato:        data.sequencialContrato,
            anoContrato:               data.anoContrato,
            processo:                  data.processo,
            objetoContrato:            data.objetoContrato,
            tipoContratoNome:          data.tipoContrato?.nome,
            categoriaNome:             data.categoriaProcesso?.nome,
            niFornecedor:              data.niFornecedor,
            nomeRazaoSocialFornecedor: data.nomeRazaoSocialFornecedor,
            tipoPessoa:                data.tipoPessoa,
            dataAssinatura:            data.dataAssinatura,
            dataVigenciaInicio:        data.dataVigenciaInicio,
            dataVigenciaFim:           data.dataVigenciaFim,
            dataPublicacaoPncp:        data.dataPublicacaoPncp,
            dataAtualizacao:           data.dataAtualizacao,
            valorInicial:              data.valorInicial,
            valorGlobal:               data.valorGlobal,
            valorAcumulado:            data.valorAcumulado,
            valorParcela:              data.valorParcela,
            numeroParcelas:            data.numeroParcelas,
            numeroRetificacao:         data.numeroRetificacao,
            receita:                   data.receita,
            informacaoComplementar:    data.informacaoComplementar,
            orgaoCnpj:                 data.orgaoEntidade?.cnpj,
            orgaoNome:                 data.orgaoEntidade?.razaoSocial,
            unidadeNome:               data.unidadeOrgao?.nomeUnidade,
            unidadeCodigo:             data.unidadeOrgao?.codigoUnidade,
            municipioNome:             data.unidadeOrgao?.municipioNome,
            ufSigla:                   data.unidadeOrgao?.ufSigla,
        }
    }
}
