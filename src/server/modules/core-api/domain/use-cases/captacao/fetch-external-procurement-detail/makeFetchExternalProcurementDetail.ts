import { FetchExternalProcurementDetail }           from "./FetchExternalProcurementDetail"
import { FetchExternalProcurementDetailController } from "./FetchExternalProcurementDetailController"

export function makeFetchExternalProcurementDetail(): FetchExternalProcurementDetailController {
    const useCase = new FetchExternalProcurementDetail()
    return new FetchExternalProcurementDetailController(useCase)
}
