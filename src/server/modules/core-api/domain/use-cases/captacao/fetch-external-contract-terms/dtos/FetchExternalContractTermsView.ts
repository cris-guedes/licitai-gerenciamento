export type ContractTerm = {
    sequencialTermoContrato?:   number
    numeroTermoContrato?:       string
    tipoTermoContratoNome?:     string
    dataAssinatura?:            string
    dataVigenciaInicio?:        string
    dataVigenciaFim?:           string
    dataPublicacaoPncp?:        string
    niFornecedor?:              string
    nomeRazaoSocialFornecedor?: string
    objetoTermoContrato?:       string
    valorGlobal?:               number
    valorAcrescido?:            number
    valorParcela?:              number
    numeroParcelas?:            number
    prazoAditadoDias?:          number
    informacaoComplementar?:    string
    informativoObservacao?:     string
    fundamentoLegal?:           string
}

export type FetchExternalContractTermsView = {
    terms: ContractTerm[]
}

export class FetchExternalContractTermsMapper {
    static toView(data: any[]): FetchExternalContractTermsView {
        return {
            terms: (data ?? []).map((t: any) => ({
                sequencialTermoContrato:   t.sequencialTermoContrato,
                numeroTermoContrato:       t.numeroTermoContrato,
                tipoTermoContratoNome:     t.tipoTermoContratoNome,
                dataAssinatura:            t.dataAssinatura,
                dataVigenciaInicio:        t.dataVigenciaInicio,
                dataVigenciaFim:           t.dataVigenciaFim,
                dataPublicacaoPncp:        t.dataPublicacaoPncp,
                niFornecedor:              t.niFornecedor,
                nomeRazaoSocialFornecedor: t.nomeRazaoSocialFornecedor,
                objetoTermoContrato:       t.objetoTermoContrato,
                valorGlobal:               t.valorGlobal,
                valorAcrescido:            t.valorAcrescido,
                valorParcela:              t.valorParcela,
                numeroParcelas:            t.numeroParcelas,
                prazoAditadoDias:          t.prazoAditadoDias,
                informacaoComplementar:    t.informacaoComplementar,
                informativoObservacao:     t.informativoObservacao,
                fundamentoLegal:           t.fundamentoLegal,
            })),
        }
    }
}
