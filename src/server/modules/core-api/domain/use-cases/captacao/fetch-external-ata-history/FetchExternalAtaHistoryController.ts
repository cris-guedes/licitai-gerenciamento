import { Controller, HttpRequest, HttpResponse, ok, serverError } from "@/server/modules/core-api/main/adapters/http-adapter"
import { FetchExternalAtaHistoryControllerSchemas } from "./FetchExternalAtaHistoryControllerSchemas"
import { FetchExternalAtaHistory } from "./FetchExternalAtaHistory"
import { z } from "zod"

interface Types {
    Body:     undefined
    Query:    FetchExternalAtaHistory.Params
    Params:   undefined
    Response: FetchExternalAtaHistory.Response
}

export class FetchExternalAtaHistoryController implements Controller<Types> {
    constructor(private readonly useCase: FetchExternalAtaHistory) {}

    async handle(request: HttpRequest<Types>): Promise<HttpResponse<FetchExternalAtaHistory.Response>> {
        try {
            const params = FetchExternalAtaHistoryControllerSchemas.Query.parse(request.query)
            const result = await this.useCase.execute(params)
            return ok(result)
        } catch (error: any) {
            if (error instanceof z.ZodError) return serverError(new Error(error.message))
            return serverError(error)
        }
    }
}
