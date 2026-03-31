import { Controller, HttpRequest, HttpResponse, ok, serverError } from "@/server/modules/core-api/main/adapters/http-adapter";
import { RegisterUserControllerSchemas } from "./RegisterUserControllerSchemas";
import { RegisterUser } from "./RegisterUser";
import { z } from "zod";

interface RegisterUserControllerTypes {
    Body:     RegisterUser.Params;
    Query:    undefined;
    Params:   undefined;
    Response: RegisterUser.Response;
}

export class RegisterUserController implements Controller<RegisterUserControllerTypes> {
    constructor(private readonly useCase: RegisterUser) {}

    async handle(request: HttpRequest<RegisterUserControllerTypes>): Promise<HttpResponse<RegisterUser.Response>> {
        try {
            const params = RegisterUserControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute(params);
            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return serverError(new Error(error.message));
            return serverError(error);
        }
    }
}

export namespace RegisterUserController {
    export type Types    = RegisterUserControllerTypes;
    export type Body     = RegisterUserControllerTypes["Body"];
    export type Response = RegisterUserControllerTypes["Response"];
}
