import { AtaProvider } from "@/server/shared/infra/providers/pnpc/atas/ata-provider"
import { ApiError } from "@/server/shared/lib/pncp"
import { FetchExternalAtaDetailMapper } from "./dtos/FetchExternalAtaDetailView"
import type { FetchExternalAtaDetailDTO } from "./dtos/FetchExternalAtaDetailDTOs"
import type { FetchExternalAtaDetailView } from "./dtos/FetchExternalAtaDetailView"

export class FetchExternalAtaDetail {

    async execute(params: FetchExternalAtaDetail.Params): Promise<FetchExternalAtaDetail.Response> {
        try {
            const result = await AtaProvider.recuperarAtaRegistoPreco({
                cnpj:             params.cnpj,
                anoCompra:        params.anoCompra,
                sequencialCompra: params.sequencialCompra,
                sequencialAta:    params.sequencialAta,
            })
            return FetchExternalAtaDetailMapper.toView(result)
        } catch (error) {
            if (error instanceof ApiError && (error.status === 404 || error.status === 400 || error.status === 422)) {
                return FetchExternalAtaDetailMapper.toView(null)
            }
            throw error
        }
    }
}

export namespace FetchExternalAtaDetail {
    export type Params   = FetchExternalAtaDetailDTO
    export type Response = FetchExternalAtaDetailView
}
