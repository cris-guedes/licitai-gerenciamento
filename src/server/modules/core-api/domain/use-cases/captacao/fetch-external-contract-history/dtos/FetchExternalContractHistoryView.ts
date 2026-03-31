export type ContractHistoryEntry = {
    dataInclusao?:              string
    tipoLogManutencaoNome?:     string
    categoriaLogManutencaoNome?: string
    justificativa?:             string
    usuarioNome?:               string
}

export type FetchExternalContractHistoryView = {
    entries: ContractHistoryEntry[]
}

export class FetchExternalContractHistoryMapper {
    static toView(data: any[]): FetchExternalContractHistoryView {
        return {
            entries: (data ?? []).map((e: any) => ({
                dataInclusao:              e.logManutencaoDataInclusao,
                tipoLogManutencaoNome:     e.tipoLogManutencaoNome,
                categoriaLogManutencaoNome: e.categoriaLogManutencaoNome,
                justificativa:             e.justificativa || undefined,
                usuarioNome:               e.usuarioNome,
            })),
        }
    }
}
