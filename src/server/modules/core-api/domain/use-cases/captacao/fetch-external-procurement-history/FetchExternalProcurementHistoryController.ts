import { Controller, HttpRequest, HttpResponse, ok, serverError } from "@/server/modules/core-api/main/adapters/http-adapter"
import { FetchExternalProcurementHistoryControllerSchemas } from "./FetchExternalProcurementHistoryControllerSchemas"
import { FetchExternalProcurementHistory } from "./FetchExternalProcurementHistory"
import { z } from "zod"

interface Types {
    Body:     undefined
    Query:    FetchExternalProcurementHistory.Params
    Params:   undefined
    Response: FetchExternalProcurementHistory.Response
}

export class FetchExternalProcurementHistoryController implements Controller<Types> {
    constructor(private readonly useCase: FetchExternalProcurementHistory) {}

    async handle(request: HttpRequest<Types>): Promise<HttpResponse<FetchExternalProcurementHistory.Response>> {
        try {
            const params = FetchExternalProcurementHistoryControllerSchemas.Query.parse(request.query)
            const result = await this.useCase.execute(params)
            return ok(result)
        } catch (error: any) {
            if (error instanceof z.ZodError) return serverError(new Error(error.message))
            return serverError(error)
        }
    }
}
