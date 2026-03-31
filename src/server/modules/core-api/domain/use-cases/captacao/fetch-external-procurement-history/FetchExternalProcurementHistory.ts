import { ContratacaoHistoricoProvider } from "@/server/shared/infra/providers/pnpc/contratacao/pncp-historico/contratacao-historico-provider"
import { FetchExternalProcurementHistoryMapper } from "./dtos/FetchExternalProcurementHistoryView"
import type { FetchExternalProcurementHistoryDTO } from "./dtos/FetchExternalProcurementHistoryDTOs"
import type { FetchExternalProcurementHistoryView } from "./dtos/FetchExternalProcurementHistoryView"

export class FetchExternalProcurementHistory {

    async execute(params: FetchExternalProcurementHistory.Params): Promise<FetchExternalProcurementHistory.Response> {
        try {
            const result = await ContratacaoHistoricoProvider.consultarHistorico({
                cnpj:       params.cnpj,
                ano:        params.ano,
                sequencial: params.sequencial,
            })
            return FetchExternalProcurementHistoryMapper.toView(Array.isArray(result) ? result : [])
        } catch {
            return FetchExternalProcurementHistoryMapper.toView([])
        }
    }
}

export namespace FetchExternalProcurementHistory {
    export type Params   = FetchExternalProcurementHistoryDTO
    export type Response = FetchExternalProcurementHistoryView
}
