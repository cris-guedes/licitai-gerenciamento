import { Controller, HttpRequest, HttpResponse, ok, serverError } from "@/server/modules/core-api/main/adapters/http-adapter"
import { FetchExternalProcurementAtasControllerSchemas } from "./FetchExternalProcurementAtasControllerSchemas"
import { FetchExternalProcurementAtas } from "./FetchExternalProcurementAtas"
import { z } from "zod"

interface Types {
    Body:     undefined
    Query:    FetchExternalProcurementAtas.Params
    Params:   undefined
    Response: FetchExternalProcurementAtas.Response
}

export class FetchExternalProcurementAtasController implements Controller<Types> {
    constructor(private readonly useCase: FetchExternalProcurementAtas) {}

    async handle(request: HttpRequest<Types>): Promise<HttpResponse<FetchExternalProcurementAtas.Response>> {
        try {
            const params = FetchExternalProcurementAtasControllerSchemas.Query.parse(request.query)
            const result = await this.useCase.execute(params)
            return ok(result)
        } catch (error: any) {
            if (error instanceof z.ZodError) return serverError(new Error(error.message))
            return serverError(error)
        }
    }
}
