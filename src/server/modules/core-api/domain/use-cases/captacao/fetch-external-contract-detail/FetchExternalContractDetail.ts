import { ContratoEmpenhoProvider } from "@/server/shared/infra/providers/pnpc/contratos/contrato-empenho-provider"
import { ApiError } from "@/server/shared/lib/pncp"
import { FetchExternalContractDetailMapper } from "./dtos/FetchExternalContractDetailView"
import type { FetchExternalContractDetailDTO } from "./dtos/FetchExternalContractDetailDTOs"
import type { FetchExternalContractDetailView } from "./dtos/FetchExternalContractDetailView"

export class FetchExternalContractDetail {

    async execute(params: FetchExternalContractDetail.Params): Promise<FetchExternalContractDetail.Response> {
        try {
            const result = await ContratoEmpenhoProvider.consultarContrato({
                cnpj:       params.cnpj,
                ano:        params.anoContrato,
                sequencial: params.sequencialContrato,
            })
            return FetchExternalContractDetailMapper.toView(result)
        } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
                return FetchExternalContractDetailMapper.toView({})
            }
            throw error
        }
    }
}

export namespace FetchExternalContractDetail {
    export type Params   = FetchExternalContractDetailDTO
    export type Response = FetchExternalContractDetailView
}
