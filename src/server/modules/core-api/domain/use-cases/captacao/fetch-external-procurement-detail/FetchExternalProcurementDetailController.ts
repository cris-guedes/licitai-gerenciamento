import { Controller, HttpRequest, HttpResponse, ok, serverError } from "@/server/modules/core-api/main/adapters/http-adapter"
import { FetchExternalProcurementDetailControllerSchemas } from "./FetchExternalProcurementDetailControllerSchemas"
import { FetchExternalProcurementDetail } from "./FetchExternalProcurementDetail"
import { z } from "zod"

interface Types {
    Body:     undefined
    Query:    FetchExternalProcurementDetail.Params
    Params:   undefined
    Response: FetchExternalProcurementDetail.Response
}

export class FetchExternalProcurementDetailController implements Controller<Types> {
    constructor(private readonly useCase: FetchExternalProcurementDetail) {}

    async handle(request: HttpRequest<Types>): Promise<HttpResponse<FetchExternalProcurementDetail.Response>> {
        try {
            const params = FetchExternalProcurementDetailControllerSchemas.Query.parse(request.query)
            const result = await this.useCase.execute(params)
            return ok(result)
        } catch (error: any) {
            if (error instanceof z.ZodError) return serverError(new Error(error.message))
            return serverError(error)
        }
    }
}
