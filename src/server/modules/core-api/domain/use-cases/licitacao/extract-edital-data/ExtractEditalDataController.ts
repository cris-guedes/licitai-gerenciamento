import { z } from "zod";
import {
    Controller,
    HttpRequest,
    HttpResponse,
    ok,
    serverError,
} from "@/server/modules/core-api/main/adapters/http-adapter";
import { ExtractEditalDataControllerSchemas } from "./ExtractEditalDataControllerSchemas";
import { ExtractEditalData } from "./ExtractEditalData";

interface ExtractEditalDataControllerTypes {
    Body:     ExtractEditalData.Params;
    Query:    undefined;
    Params:   undefined;
    Response: ExtractEditalData.Response;
}

export class ExtractEditalDataController
    implements Controller<ExtractEditalDataControllerTypes>
{
    constructor(private readonly useCase: ExtractEditalData) {}

    async handle(
        request: HttpRequest<ExtractEditalDataControllerTypes>,
    ): Promise<HttpResponse<ExtractEditalData.Response>> {
        try {
            const body = ExtractEditalDataControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute(body);
            return ok(result);
        } catch (error: any) {
            console.error(error?.stack ?? error);
            if (error instanceof z.ZodError) return serverError(new Error(error.message));
            return serverError(error);
        }
    }
}

export namespace ExtractEditalDataController {
    export type Types    = ExtractEditalDataControllerTypes;
    export type Body     = ExtractEditalDataControllerTypes["Body"];
    export type Response = ExtractEditalDataControllerTypes["Response"];
}
