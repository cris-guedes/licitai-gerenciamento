import { FetchExternalProcurementHistory }           from "./FetchExternalProcurementHistory"
import { FetchExternalProcurementHistoryController } from "./FetchExternalProcurementHistoryController"

export function makeFetchExternalProcurementHistory(): FetchExternalProcurementHistoryController {
    const useCase = new FetchExternalProcurementHistory()
    return new FetchExternalProcurementHistoryController(useCase)
}
