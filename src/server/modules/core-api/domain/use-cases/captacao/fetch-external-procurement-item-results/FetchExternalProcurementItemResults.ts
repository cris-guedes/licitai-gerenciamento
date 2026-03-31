import { ContratacaoProvider } from "@/server/shared/infra/providers/pnpc/contratacao/pncp/contratacao-provider"
import { ApiError } from "@/server/shared/lib/pncp"
import { FetchExternalProcurementItemResultsMapper } from "./dtos/FetchExternalProcurementItemResultsView"
import type { FetchExternalProcurementItemResultsDTO } from "./dtos/FetchExternalProcurementItemResultsDTOs"
import type { FetchExternalProcurementItemResultsView } from "./dtos/FetchExternalProcurementItemResultsView"

export class FetchExternalProcurementItemResults {

    async execute(params: FetchExternalProcurementItemResults.Params): Promise<FetchExternalProcurementItemResults.Response> {
        try {
            const results = await ContratacaoProvider.recuperarResultados({
                cnpj:       params.cnpj,
                ano:        params.ano,
                sequencial: params.sequencial,
                numeroItem: params.numeroItem,
            })
            return FetchExternalProcurementItemResultsMapper.toView(Array.isArray(results) ? results : [])
        } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
                return FetchExternalProcurementItemResultsMapper.toView([])
            }
            throw error
        }
    }
}

export namespace FetchExternalProcurementItemResults {
    export type Params   = FetchExternalProcurementItemResultsDTO
    export type Response = FetchExternalProcurementItemResultsView
}
