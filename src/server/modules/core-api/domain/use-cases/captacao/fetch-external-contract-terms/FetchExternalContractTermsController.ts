import { Controller, HttpRequest, HttpResponse, ok, serverError } from "@/server/modules/core-api/main/adapters/http-adapter"
import { FetchExternalContractTermsControllerSchemas } from "./FetchExternalContractTermsControllerSchemas"
import { FetchExternalContractTerms } from "./FetchExternalContractTerms"
import { z } from "zod"

interface Types {
    Body:     undefined
    Query:    FetchExternalContractTerms.Params
    Params:   undefined
    Response: FetchExternalContractTerms.Response
}

export class FetchExternalContractTermsController implements Controller<Types> {
    constructor(private readonly useCase: FetchExternalContractTerms) {}

    async handle(request: HttpRequest<Types>): Promise<HttpResponse<FetchExternalContractTerms.Response>> {
        try {
            const params = FetchExternalContractTermsControllerSchemas.Query.parse(request.query)
            const result = await this.useCase.execute(params)
            return ok(result)
        } catch (error: any) {
            if (error instanceof z.ZodError) return serverError(new Error(error.message))
            return serverError(error)
        }
    }
}
