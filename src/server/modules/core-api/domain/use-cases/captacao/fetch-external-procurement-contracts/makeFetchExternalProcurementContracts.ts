import { FetchExternalProcurementContracts }           from "./FetchExternalProcurementContracts"
import { FetchExternalProcurementContractsController } from "./FetchExternalProcurementContractsController"

export function makeFetchExternalProcurementContracts(): FetchExternalProcurementContractsController {
    const useCase = new FetchExternalProcurementContracts()
    return new FetchExternalProcurementContractsController(useCase)
}
