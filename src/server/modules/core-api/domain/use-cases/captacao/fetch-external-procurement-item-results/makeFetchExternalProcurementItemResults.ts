import { FetchExternalProcurementItemResults }           from "./FetchExternalProcurementItemResults"
import { FetchExternalProcurementItemResultsController } from "./FetchExternalProcurementItemResultsController"

export function makeFetchExternalProcurementItemResults(): FetchExternalProcurementItemResultsController {
    const useCase = new FetchExternalProcurementItemResults()
    return new FetchExternalProcurementItemResultsController(useCase)
}
