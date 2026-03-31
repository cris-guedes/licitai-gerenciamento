import { FetchExternalAtaDetail }           from "./FetchExternalAtaDetail"
import { FetchExternalAtaDetailController } from "./FetchExternalAtaDetailController"

export function makeFetchExternalAtaDetail(): FetchExternalAtaDetailController {
    const useCase = new FetchExternalAtaDetail()
    return new FetchExternalAtaDetailController(useCase)
}
