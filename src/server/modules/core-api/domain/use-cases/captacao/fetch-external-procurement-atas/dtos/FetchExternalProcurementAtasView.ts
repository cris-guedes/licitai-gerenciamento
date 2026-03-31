export type FetchExternalProcurementAtasView = {
    atas: Array<{
        numeroAtaRegistroPreco?: string
        anoAta?: number
        sequencialAta?: number
        numeroControlePNCP?: string
        objetoCompra?: string
        dataAssinatura?: string
        dataVigenciaInicio?: string
        dataVigenciaFim?: string
        dataCancelamento?: string
        cancelado?: boolean
        dataPublicacaoPncp?: string
    }>
}

export class FetchExternalProcurementAtasMapper {
    static toView(data: any[]): FetchExternalProcurementAtasView {
        return {
            atas: (data ?? []).map((a: any) => ({
                numeroAtaRegistroPreco: a.numeroAtaRegistroPreco || a.numeroAta,
                anoAta:                 a.anoAta,
                sequencialAta:          a.sequencialAta,
                numeroControlePNCP:     a.numeroControlePNCP || a.numeroControlePncp,
                objetoCompra:           a.objetoCompra,
                dataAssinatura:         a.dataAssinatura,
                dataVigenciaInicio:     a.dataVigenciaInicio,
                dataVigenciaFim:        a.dataVigenciaFim,
                dataCancelamento:       a.dataCancelamento,
                cancelado:              a.cancelado,
                dataPublicacaoPncp:     a.dataPublicacaoPncp || a.dataPublicacaoPNCP,
            })),
        }
    }
}
