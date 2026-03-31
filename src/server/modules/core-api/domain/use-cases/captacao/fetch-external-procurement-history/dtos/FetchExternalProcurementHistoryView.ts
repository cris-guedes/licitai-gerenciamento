export type ProcurementHistoryEntry = {
    dataInclusao?:             string
    tipoLogManutencaoNome?:    string
    categoriaLogManutencaoNome?: string
    justificativa?:            string
    usuarioNome?:              string
    documentoTipo?:            string
    documentoTitulo?:          string
    itemNumero?:               number
}

export type FetchExternalProcurementHistoryView = {
    entries: ProcurementHistoryEntry[]
}

export class FetchExternalProcurementHistoryMapper {
    static toView(data: any[]): FetchExternalProcurementHistoryView {
        return {
            entries: (data ?? []).map((e: any) => ({
                dataInclusao:              e.logManutencaoDataInclusao,
                tipoLogManutencaoNome:     e.tipoLogManutencaoNome,
                categoriaLogManutencaoNome: e.categoriaLogManutencaoNome,
                justificativa:             e.justificativa || undefined,
                usuarioNome:               e.usuarioNome,
                documentoTipo:             e.documentoTipo || undefined,
                documentoTitulo:           e.documentoTitulo || undefined,
                itemNumero:                e.itemNumero ?? undefined,
            })),
        }
    }
}
