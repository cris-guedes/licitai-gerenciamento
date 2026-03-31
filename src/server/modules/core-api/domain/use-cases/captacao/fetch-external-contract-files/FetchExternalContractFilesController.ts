import { Controller, HttpRequest, HttpResponse, ok, serverError } from "@/server/modules/core-api/main/adapters/http-adapter"
import { FetchExternalContractFilesControllerSchemas } from "./FetchExternalContractFilesControllerSchemas"
import { FetchExternalContractFiles } from "./FetchExternalContractFiles"
import { z } from "zod"

interface Types {
    Body:     undefined
    Query:    FetchExternalContractFiles.Params
    Params:   undefined
    Response: FetchExternalContractFiles.Response
}

export class FetchExternalContractFilesController implements Controller<Types> {
    constructor(private readonly useCase: FetchExternalContractFiles) {}

    async handle(request: HttpRequest<Types>): Promise<HttpResponse<FetchExternalContractFiles.Response>> {
        try {
            const params = FetchExternalContractFilesControllerSchemas.Query.parse(request.query)
            const result = await this.useCase.execute(params)
            return ok(result)
        } catch (error: any) {
            if (error instanceof z.ZodError) return serverError(new Error(error.message))
            return serverError(error)
        }
    }
}
