import { AtaProvider } from "@/server/shared/infra/providers/pnpc/atas/ata-provider"
import { ApiError } from "@/server/shared/lib/pncp"
import { FetchExternalAtaFilesMapper } from "./dtos/FetchExternalAtaFilesView"
import type { FetchExternalAtaFilesDTO } from "./dtos/FetchExternalAtaFilesDTOs"
import type { FetchExternalAtaFilesView } from "./dtos/FetchExternalAtaFilesView"

export class FetchExternalAtaFiles {

    async execute(params: FetchExternalAtaFiles.Params): Promise<FetchExternalAtaFiles.Response> {
        try {
            const files = await AtaProvider.recuperarInformacoesDocumentosAta({
                cnpj:             params.cnpj,
                anoCompra:        params.anoCompra,
                sequencialCompra: params.sequencialCompra,
                sequencialAta:    params.sequencialAta,
            })
            return FetchExternalAtaFilesMapper.toView(Array.isArray(files) ? files : [])
        } catch (error) {
            if (error instanceof ApiError && (error.status === 404 || error.status === 400 || error.status === 422)) {
                return FetchExternalAtaFilesMapper.toView([])
            }
            throw error
        }
    }
}

export namespace FetchExternalAtaFiles {
    export type Params   = FetchExternalAtaFilesDTO
    export type Response = FetchExternalAtaFilesView
}
