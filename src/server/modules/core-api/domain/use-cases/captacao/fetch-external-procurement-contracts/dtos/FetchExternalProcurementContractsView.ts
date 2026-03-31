export type FetchExternalProcurementContractsView = {
    contracts: Array<{
        numeroContratoEmpenho?: string
        anoContrato?: number
        sequencialContrato?: number
        numeroControlePNCP?: string
        objetoContrato?: string
        niFornecedor?: string
        nomeRazaoSocialFornecedor?: string
        tipoPessoa?: string
        dataAssinatura?: string
        dataVigenciaInicio?: string
        dataVigenciaFim?: string
        dataPublicacaoPncp?: string
        valorInicial?: number
        valorGlobal?: number
        valorAcumulado?: number
        tipoContratoNome?: string
        informacaoComplementar?: string
    }>
}

export class FetchExternalProcurementContractsMapper {
    static toView(data: any[]): FetchExternalProcurementContractsView {
        return {
            contracts: (data ?? []).map((c: any) => ({
                numeroContratoEmpenho:     c.numeroContratoEmpenho || c.numeroContrato,
                anoContrato:               c.anoContrato,
                sequencialContrato:        c.sequencialContrato,
                numeroControlePNCP:        c.numeroControlePNCP || c.numeroControlePncp,
                objetoContrato:            c.objetoContrato,
                niFornecedor:              c.niFornecedor,
                nomeRazaoSocialFornecedor: c.nomeRazaoSocialFornecedor,
                tipoPessoa:                c.tipoPessoa,
                dataAssinatura:            c.dataAssinatura,
                dataVigenciaInicio:        c.dataVigenciaInicio,
                dataVigenciaFim:           c.dataVigenciaFim,
                dataPublicacaoPncp:        c.dataPublicacaoPncp || c.dataPublicacaoPNCP,
                valorInicial:              c.valorInicial,
                valorGlobal:               c.valorGlobal,
                valorAcumulado:            c.valorAcumulado,
                tipoContratoNome:          c.tipoContratoNome || c.tipoContrato?.nome,
                informacaoComplementar:    c.informacaoComplementar,
            })),
        }
    }
}
