import { AtaProvider } from "@/server/shared/infra/providers/pnpc/atas/ata-provider"
import { ApiError } from "@/server/shared/lib/pncp"
import { FetchExternalProcurementAtasMapper } from "./dtos/FetchExternalProcurementAtasView"
import type { FetchExternalProcurementAtasDTO } from "./dtos/FetchExternalProcurementAtasDTOs"
import type { FetchExternalProcurementAtasView } from "./dtos/FetchExternalProcurementAtasView"

export class FetchExternalProcurementAtas {

    async execute(params: FetchExternalProcurementAtas.Params): Promise<FetchExternalProcurementAtas.Response> {
        try {
            const result = await AtaProvider.recuperarAtasPorFiltros({
                cnpj:              params.cnpj,
                anoCompra:         params.ano,
                sequencialCompra:  params.sequencial,
            })
            return FetchExternalProcurementAtasMapper.toView(result?.data ?? [])
        } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
                return FetchExternalProcurementAtasMapper.toView([])
            }
            throw error
        }
    }
}

export namespace FetchExternalProcurementAtas {
    export type Params   = FetchExternalProcurementAtasDTO
    export type Response = FetchExternalProcurementAtasView
}
