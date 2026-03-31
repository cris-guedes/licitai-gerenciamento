import { FetchExternalContractTerms }           from "./FetchExternalContractTerms"
import { FetchExternalContractTermsController } from "./FetchExternalContractTermsController"

export function makeFetchExternalContractTerms(): FetchExternalContractTermsController {
    const useCase = new FetchExternalContractTerms()
    return new FetchExternalContractTermsController(useCase)
}
