export type ProcurementItemResult = {
    sequencialResultado?:         number
    niFornecedor?:                string
    nomeRazaoSocialFornecedor?:   string
    tipoPessoa?:                  string
    porteFornecedorNome?:         string
    valorUnitarioHomologado?:     number
    valorTotalHomologado?:        number
    quantidadeHomologada?:        number
    percentualDesconto?:          number
    situacaoCompraItemResultadoNome?: string
    aplicacaoBeneficioMeEpp?:    boolean
    dataResultado?:               string
    motivoCancelamento?:          string
}

export type FetchExternalProcurementItemResultsView = {
    results: ProcurementItemResult[]
}

export class FetchExternalProcurementItemResultsMapper {
    static toView(data: any[]): FetchExternalProcurementItemResultsView {
        return {
            results: (data ?? []).map((e: any) => ({
                sequencialResultado:            e.sequencialResultado,
                niFornecedor:                   e.niFornecedor,
                nomeRazaoSocialFornecedor:      e.nomeRazaoSocialFornecedor,
                tipoPessoa:                     e.tipoPessoa,
                porteFornecedorNome:            e.porteFornecedorNome,
                valorUnitarioHomologado:        e.valorUnitarioHomologado,
                valorTotalHomologado:           e.valorTotalHomologado,
                quantidadeHomologada:           e.quantidadeHomologada,
                percentualDesconto:             e.percentualDesconto ?? undefined,
                situacaoCompraItemResultadoNome: e.situacaoCompraItemResultadoNome,
                aplicacaoBeneficioMeEpp:        e.aplicacaoBeneficioMeEpp,
                dataResultado:                  e.dataResultado,
                motivoCancelamento:             e.motivoCancelamento ?? undefined,
            })),
        }
    }
}
