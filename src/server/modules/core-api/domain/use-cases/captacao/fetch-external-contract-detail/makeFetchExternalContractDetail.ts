import { FetchExternalContractDetail }           from "./FetchExternalContractDetail"
import { FetchExternalContractDetailController } from "./FetchExternalContractDetailController"

export function makeFetchExternalContractDetail(): FetchExternalContractDetailController {
    const useCase = new FetchExternalContractDetail()
    return new FetchExternalContractDetailController(useCase)
}
