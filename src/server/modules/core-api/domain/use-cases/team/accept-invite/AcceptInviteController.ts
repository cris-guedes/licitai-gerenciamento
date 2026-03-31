import { Controller, HttpRequest, HttpResponse, ok, badRequest, notFound, serverError } from "@/server/modules/core-api/main/adapters/http-adapter";
import { AcceptInviteControllerSchemas } from "./AcceptInviteControllerSchemas";
import { AcceptInvite } from "./AcceptInvite";
import { z } from "zod";

interface AcceptInviteControllerTypes {
    Body:     AcceptInviteControllerSchemas.Input;
    Query:    null;
    Params:   null;
    Response: AcceptInvite.Response;
}

export class AcceptInviteController implements Controller<AcceptInviteControllerTypes> {
    constructor(private readonly useCase: AcceptInvite) {}

    async handle(request: HttpRequest<AcceptInviteControllerTypes>): Promise<HttpResponse<AcceptInvite.Response>> {
        try {
            const body = AcceptInviteControllerSchemas.Body.parse(request.body);

            const result = await this.useCase.execute(body);

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error.message?.includes("inválido ou expirado")) return notFound(error);
            return serverError(error);
        }
    }
}
