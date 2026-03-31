import { Controller, HttpRequest, HttpResponse, ok, serverError } from "@/server/modules/core-api/main/adapters/http-adapter"
import { FetchExternalProcurementItemResultsControllerSchemas } from "./FetchExternalProcurementItemResultsControllerSchemas"
import { FetchExternalProcurementItemResults } from "./FetchExternalProcurementItemResults"
import { z } from "zod"

interface Types {
    Body:     undefined
    Query:    FetchExternalProcurementItemResults.Params
    Params:   undefined
    Response: FetchExternalProcurementItemResults.Response
}

export class FetchExternalProcurementItemResultsController implements Controller<Types> {
    constructor(private readonly useCase: FetchExternalProcurementItemResults) {}

    async handle(request: HttpRequest<Types>): Promise<HttpResponse<FetchExternalProcurementItemResults.Response>> {
        try {
            const params = FetchExternalProcurementItemResultsControllerSchemas.Query.parse(request.query)
            const result = await this.useCase.execute(params)
            return ok(result)
        } catch (error: any) {
            if (error instanceof z.ZodError) return serverError(new Error(error.message))
            return serverError(error)
        }
    }
}
