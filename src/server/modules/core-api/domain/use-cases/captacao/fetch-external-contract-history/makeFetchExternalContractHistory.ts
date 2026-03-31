import { FetchExternalContractHistory }           from "./FetchExternalContractHistory"
import { FetchExternalContractHistoryController } from "./FetchExternalContractHistoryController"

export function makeFetchExternalContractHistory(): FetchExternalContractHistoryController {
    const useCase = new FetchExternalContractHistory()
    return new FetchExternalContractHistoryController(useCase)
}
