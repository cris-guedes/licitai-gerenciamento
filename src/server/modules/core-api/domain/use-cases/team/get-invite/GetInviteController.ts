import { Controller, HttpRequest, HttpResponse, ok, badRequest, notFound, serverError } from "@/server/modules/core-api/main/adapters/http-adapter";
import { GetInviteControllerSchemas } from "./GetInviteControllerSchemas";
import { GetInvite } from "./GetInvite";
import { z } from "zod";

interface GetInviteControllerTypes {
    Body:     null;
    Query:    GetInviteControllerSchemas.Input;
    Params:   null;
    Response: GetInvite.Response;
}

export class GetInviteController implements Controller<GetInviteControllerTypes> {
    constructor(private readonly useCase: GetInvite) {}

    async handle(request: HttpRequest<GetInviteControllerTypes>): Promise<HttpResponse<GetInvite.Response>> {
        try {
            const query = GetInviteControllerSchemas.Query.parse(request.query);

            const result = await this.useCase.execute({ token: query.token });

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error.message?.includes("inválido ou expirado")) return notFound(error);
            return serverError(error);
        }
    }
}
