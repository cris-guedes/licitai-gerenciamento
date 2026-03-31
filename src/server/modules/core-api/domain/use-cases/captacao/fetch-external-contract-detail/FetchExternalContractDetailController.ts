import { Controller, HttpRequest, HttpResponse, ok, serverError } from "@/server/modules/core-api/main/adapters/http-adapter"
import { FetchExternalContractDetailControllerSchemas } from "./FetchExternalContractDetailControllerSchemas"
import { FetchExternalContractDetail } from "./FetchExternalContractDetail"
import { z } from "zod"

interface Types {
    Body:     undefined
    Query:    FetchExternalContractDetail.Params
    Params:   undefined
    Response: FetchExternalContractDetail.Response
}

export class FetchExternalContractDetailController implements Controller<Types> {
    constructor(private readonly useCase: FetchExternalContractDetail) {}

    async handle(request: HttpRequest<Types>): Promise<HttpResponse<FetchExternalContractDetail.Response>> {
        try {
            const params = FetchExternalContractDetailControllerSchemas.Query.parse(request.query)
            const result = await this.useCase.execute(params)
            return ok(result)
        } catch (error: any) {
            if (error instanceof z.ZodError) return serverError(new Error(error.message))
            return serverError(error)
        }
    }
}
