export type AtaHistoryEntry = {
    dataInclusao?:               string
    tipoLogManutencaoNome?:      string
    categoriaLogManutencaoNome?: string
    justificativa?:              string
    usuarioNome?:                string
}

export type FetchExternalAtaHistoryView = {
    entries: AtaHistoryEntry[]
}

export class FetchExternalAtaHistoryMapper {
    static toView(data: any[]): FetchExternalAtaHistoryView {
        return {
            entries: (data ?? []).map((e: any) => ({
                dataInclusao:               e.logManutencaoDataInclusao,
                tipoLogManutencaoNome:      e.tipoLogManutencaoNome,
                categoriaLogManutencaoNome: e.categoriaLogManutencaoNome,
                justificativa:              e.justificativa || undefined,
                usuarioNome:                e.usuarioNome,
            })),
        }
    }
}
