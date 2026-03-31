import { ContratoEmpenhoProvider } from "@/server/shared/infra/providers/pnpc/contratos/contrato-empenho-provider"
import { ApiError } from "@/server/shared/lib/pncp"
import { FetchExternalContractFilesMapper } from "./dtos/FetchExternalContractFilesView"
import type { FetchExternalContractFilesDTO } from "./dtos/FetchExternalContractFilesDTOs"
import type { FetchExternalContractFilesView } from "./dtos/FetchExternalContractFilesView"

export class FetchExternalContractFiles {

    async execute(params: FetchExternalContractFiles.Params): Promise<FetchExternalContractFiles.Response> {
        try {
            const files = await ContratoEmpenhoProvider.recuperarInformacoesDocumentosContrato({
                cnpj:       params.cnpj,
                ano:        params.anoContrato,
                sequencial: params.sequencialContrato,
            })
            return FetchExternalContractFilesMapper.toView(Array.isArray(files) ? files : [])
        } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
                return FetchExternalContractFilesMapper.toView([])
            }
            throw error
        }
    }
}

export namespace FetchExternalContractFiles {
    export type Params   = FetchExternalContractFilesDTO
    export type Response = FetchExternalContractFilesView
}
