import { ContratacaoProvider } from "@/server/shared/infra/providers/pnpc/contratacao/pncp/contratacao-provider"
import { ApiError } from "@/server/shared/lib/pncp"
import { FetchExternalProcurementFilesMapper } from "./dtos/FetchExternalProcurementFilesView"
import type { FetchExternalProcurementFilesDTO } from "./dtos/FetchExternalProcurementFilesDTOs"
import type { FetchExternalProcurementFilesView } from "./dtos/FetchExternalProcurementFilesView"

export class FetchExternalProcurementFiles {

    async execute(params: FetchExternalProcurementFiles.Params): Promise<FetchExternalProcurementFiles.Response> {
        try {
            const files = await ContratacaoProvider.recuperarInformacoesDocumentosCompra({
                cnpj:       params.cnpj,
                ano:        params.ano,
                sequencial: params.sequencial,
            })
            return FetchExternalProcurementFilesMapper.toView(files)
        } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
                return FetchExternalProcurementFilesMapper.toView([])
            }
            throw error
        }
    }
}

export namespace FetchExternalProcurementFiles {
    export type Params   = FetchExternalProcurementFilesDTO
    export type Response = FetchExternalProcurementFilesView
}
