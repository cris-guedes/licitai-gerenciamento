import { FetchExternalContractFiles }           from "./FetchExternalContractFiles"
import { FetchExternalContractFilesController } from "./FetchExternalContractFilesController"

export function makeFetchExternalContractFiles(): FetchExternalContractFilesController {
    const useCase = new FetchExternalContractFiles()
    return new FetchExternalContractFilesController(useCase)
}
