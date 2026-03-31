import { FetchExternalAtaFiles }           from "./FetchExternalAtaFiles"
import { FetchExternalAtaFilesController } from "./FetchExternalAtaFilesController"

export function makeFetchExternalAtaFiles(): FetchExternalAtaFilesController {
    const useCase = new FetchExternalAtaFiles()
    return new FetchExternalAtaFilesController(useCase)
}
