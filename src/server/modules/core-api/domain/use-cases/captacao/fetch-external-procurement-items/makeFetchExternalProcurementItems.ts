import { FetchExternalProcurementItems }           from "./FetchExternalProcurementItems"
import { FetchExternalProcurementItemsController } from "./FetchExternalProcurementItemsController"

export function makeFetchExternalProcurementItems(): FetchExternalProcurementItemsController {
    const useCase = new FetchExternalProcurementItems()
    return new FetchExternalProcurementItemsController(useCase)
}
