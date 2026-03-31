import { AtaProvider } from "@/server/shared/infra/providers/pnpc/atas/ata-provider"
import { FetchExternalAtaHistoryMapper } from "./dtos/FetchExternalAtaHistoryView"
import type { FetchExternalAtaHistoryDTO } from "./dtos/FetchExternalAtaHistoryDTOs"
import type { FetchExternalAtaHistoryView } from "./dtos/FetchExternalAtaHistoryView"

export class FetchExternalAtaHistory {

    async execute(params: FetchExternalAtaHistory.Params): Promise<FetchExternalAtaHistory.Response> {
        try {
            const result = await AtaProvider.consultarHistoricoAta({
                cnpj:          params.cnpj,
                ano:           params.anoCompra,
                sequencial:    params.sequencialCompra,
                sequencialAta: params.sequencialAta,
            })
            return FetchExternalAtaHistoryMapper.toView(Array.isArray(result) ? result : [])
        } catch {
            return FetchExternalAtaHistoryMapper.toView([])
        }
    }
}

export namespace FetchExternalAtaHistory {
    export type Params   = FetchExternalAtaHistoryDTO
    export type Response = FetchExternalAtaHistoryView
}
