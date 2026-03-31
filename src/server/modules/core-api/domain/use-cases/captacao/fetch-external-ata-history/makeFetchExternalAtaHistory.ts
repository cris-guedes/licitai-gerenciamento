import { FetchExternalAtaHistory }           from "./FetchExternalAtaHistory"
import { FetchExternalAtaHistoryController } from "./FetchExternalAtaHistoryController"

export function makeFetchExternalAtaHistory(): FetchExternalAtaHistoryController {
    const useCase = new FetchExternalAtaHistory()
    return new FetchExternalAtaHistoryController(useCase)
}
