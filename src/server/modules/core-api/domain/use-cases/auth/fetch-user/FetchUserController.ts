import { Controller, HttpRequest, HttpResponse, ok, serverError, notFound } from "@/server/modules/core-api/main/adapters/http-adapter";
import { FetchUserControllerSchemas } from "./FetchUserControllerSchemas";
import { FetchUser } from "./FetchUser";
import { z } from "zod";

interface FetchUserControllerTypes {
    Body:     undefined;
    Query:    FetchUser.Params;
    Params:   undefined;
    Response: FetchUser.Response;
}

export class FetchUserController implements Controller<FetchUserControllerTypes> {
    constructor(private readonly useCase: FetchUser) {}

    async handle(request: HttpRequest<FetchUserControllerTypes>): Promise<HttpResponse<FetchUser.Response>> {
        try {
            const params = FetchUserControllerSchemas.Query.parse(request.query);
            const result = await this.useCase.execute(params);
            
            if (!result) return notFound(new Error('User not found'));

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return serverError(new Error(error.message));
            return serverError(error);
        }
    }
}

export namespace FetchUserController {
    export type Types    = FetchUserControllerTypes;
    export type Query    = FetchUserControllerTypes["Query"];
    export type Response = FetchUserControllerTypes["Response"];
}
