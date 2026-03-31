import { ContratoEmpenhoProvider } from "@/server/shared/infra/providers/pnpc/contratos/contrato-empenho-provider"
import { ApiError } from "@/server/shared/lib/pncp"
import { FetchExternalProcurementContractsMapper } from "./dtos/FetchExternalProcurementContractsView"
import type { FetchExternalProcurementContractsDTO } from "./dtos/FetchExternalProcurementContractsDTOs"
import type { FetchExternalProcurementContractsView } from "./dtos/FetchExternalProcurementContractsView"

export class FetchExternalProcurementContracts {

    async execute(params: FetchExternalProcurementContracts.Params): Promise<FetchExternalProcurementContracts.Response> {
        try {
            const result = await ContratoEmpenhoProvider.consultarContratosContratacao({
                cnpj:                    params.cnpj,
                anoContratacao:          params.ano,
                sequencialContratacao:   params.sequencial,
                pagina:                  1,
            })
            return FetchExternalProcurementContractsMapper.toView(result?.data ?? [])
        } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
                return FetchExternalProcurementContractsMapper.toView([])
            }
            throw error
        }
    }
}

export namespace FetchExternalProcurementContracts {
    export type Params   = FetchExternalProcurementContractsDTO
    export type Response = FetchExternalProcurementContractsView
}
