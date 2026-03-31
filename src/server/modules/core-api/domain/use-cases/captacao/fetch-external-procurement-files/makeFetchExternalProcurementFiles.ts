import { FetchExternalProcurementFiles }           from "./FetchExternalProcurementFiles"
import { FetchExternalProcurementFilesController } from "./FetchExternalProcurementFilesController"

export function makeFetchExternalProcurementFiles(): FetchExternalProcurementFilesController {
    const useCase = new FetchExternalProcurementFiles()
    return new FetchExternalProcurementFilesController(useCase)
}
