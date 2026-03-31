import { TermoContratoProvider } from "@/server/shared/infra/providers/pnpc/contratos/termo-contrato-provider"
import { ApiError } from "@/server/shared/lib/pncp"
import { FetchExternalContractTermsMapper } from "./dtos/FetchExternalContractTermsView"
import type { FetchExternalContractTermsDTO } from "./dtos/FetchExternalContractTermsDTOs"
import type { FetchExternalContractTermsView } from "./dtos/FetchExternalContractTermsView"

export class FetchExternalContractTerms {

    async execute(params: FetchExternalContractTerms.Params): Promise<FetchExternalContractTerms.Response> {
        try {
            const result = await TermoContratoProvider.recuperarTermosContrato({
                cnpj:       params.cnpj,
                ano:        params.anoContrato,
                sequencial: params.sequencialContrato,
            })
            // PNCP returns 204 No Content (→ undefined) when the contract has no additive terms
            const items = Array.isArray(result) ? result : []
            return FetchExternalContractTermsMapper.toView(items)
        } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
                return FetchExternalContractTermsMapper.toView([])
            }
            throw error
        }
    }
}

export namespace FetchExternalContractTerms {
    export type Params   = FetchExternalContractTermsDTO
    export type Response = FetchExternalContractTermsView
}
