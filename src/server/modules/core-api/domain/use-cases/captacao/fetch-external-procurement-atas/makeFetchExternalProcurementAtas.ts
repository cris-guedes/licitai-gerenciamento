import { FetchExternalProcurementAtas }           from "./FetchExternalProcurementAtas"
import { FetchExternalProcurementAtasController } from "./FetchExternalProcurementAtasController"

export function makeFetchExternalProcurementAtas(): FetchExternalProcurementAtasController {
    const useCase = new FetchExternalProcurementAtas()
    return new FetchExternalProcurementAtasController(useCase)
}
