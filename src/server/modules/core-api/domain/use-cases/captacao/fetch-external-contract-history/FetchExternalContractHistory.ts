import { ContratoEmpenhoProvider } from "@/server/shared/infra/providers/pnpc/contratos/contrato-empenho-provider"
import { FetchExternalContractHistoryMapper } from "./dtos/FetchExternalContractHistoryView"
import type { FetchExternalContractHistoryDTO } from "./dtos/FetchExternalContractHistoryDTOs"
import type { FetchExternalContractHistoryView } from "./dtos/FetchExternalContractHistoryView"

export class FetchExternalContractHistory {

    async execute(params: FetchExternalContractHistory.Params): Promise<FetchExternalContractHistory.Response> {
        try {
            const result = await ContratoEmpenhoProvider.consultarContrato1({
                cnpj:       params.cnpj,
                ano:        params.anoContrato,
                sequencial: params.sequencialContrato,
            })
            return FetchExternalContractHistoryMapper.toView(Array.isArray(result) ? result : [])
        } catch {
            return FetchExternalContractHistoryMapper.toView([])
        }
    }
}

export namespace FetchExternalContractHistory {
    export type Params   = FetchExternalContractHistoryDTO
    export type Response = FetchExternalContractHistoryView
}
