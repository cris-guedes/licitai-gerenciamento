import { ContratacaoProvider } from "@/server/shared/infra/providers/pnpc/contratacao/pncp/contratacao-provider"
import { ApiError } from "@/server/shared/lib/pncp"
import { FetchExternalProcurementItemsMapper } from "./dtos/FetchExternalProcurementItemsView"
import type { FetchExternalProcurementItemsDTO } from "./dtos/FetchExternalProcurementItemsDTOs"
import type { FetchExternalProcurementItemsView } from "./dtos/FetchExternalProcurementItemsView"

export class FetchExternalProcurementItems {

    async execute(params: FetchExternalProcurementItems.Params): Promise<FetchExternalProcurementItems.Response> {
        try {
            const items = await ContratacaoProvider.pesquisarCompraItem({
                cnpj:          params.cnpj,
                ano:           params.ano,
                sequencial:    params.sequencial,
                pagina:        params.pagina,
                tamanhoPagina: params.tamanhoPagina,
            })
            return FetchExternalProcurementItemsMapper.toView(items, items.length)
        } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
                return FetchExternalProcurementItemsMapper.toView([], 0)
            }
            throw error
        }
    }
}

export namespace FetchExternalProcurementItems {
    export type Params   = FetchExternalProcurementItemsDTO
    export type Response = FetchExternalProcurementItemsView
}
