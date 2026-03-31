import { Controller, HttpRequest, HttpResponse, ok, serverError } from "@/server/modules/core-api/main/adapters/http-adapter"
import { FetchExternalAtaFilesControllerSchemas } from "./FetchExternalAtaFilesControllerSchemas"
import { FetchExternalAtaFiles } from "./FetchExternalAtaFiles"
import { z } from "zod"

interface Types {
    Body:     undefined
    Query:    FetchExternalAtaFiles.Params
    Params:   undefined
    Response: FetchExternalAtaFiles.Response
}

export class FetchExternalAtaFilesController implements Controller<Types> {
    constructor(private readonly useCase: FetchExternalAtaFiles) {}

    async handle(request: HttpRequest<Types>): Promise<HttpResponse<FetchExternalAtaFiles.Response>> {
        try {
            const params = FetchExternalAtaFilesControllerSchemas.Query.parse(request.query)
            const result = await this.useCase.execute(params)
            return ok(result)
        } catch (error: any) {
            if (error instanceof z.ZodError) return serverError(new Error(error.message))
            return serverError(error)
        }
    }
}
