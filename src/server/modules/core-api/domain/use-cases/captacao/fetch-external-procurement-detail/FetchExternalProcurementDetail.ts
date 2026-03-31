import { ContratacaoConsultaProvider } from "@/server/shared/infra/providers/pnpc/contratacao/pncp-consultas/contratacao-consulta-provider"
import { ApiError } from "@/server/shared/lib/pncp"
import { FetchExternalProcurementDetailMapper } from "./dtos/FetchExternalProcurementDetailView"
import type { FetchExternalProcurementDetailDTO } from "./dtos/FetchExternalProcurementDetailDTOs"
import type { FetchExternalProcurementDetailView } from "./dtos/FetchExternalProcurementDetailView"

export class FetchExternalProcurementDetail {

    async execute(params: FetchExternalProcurementDetail.Params): Promise<FetchExternalProcurementDetail.Response> {
        try {
            const result = await ContratacaoConsultaProvider.consultarCompra({
                cnpj:       params.cnpj,
                ano:        params.ano,
                sequencial: params.sequencial,
            })
            return FetchExternalProcurementDetailMapper.toView(result)
        } catch (error) {
            if (error instanceof ApiError) {
                return FetchExternalProcurementDetailMapper.toView(null)
            }
            throw error
        }
    }
}

export namespace FetchExternalProcurementDetail {
    export type Params   = FetchExternalProcurementDetailDTO
    export type Response = FetchExternalProcurementDetailView
}
