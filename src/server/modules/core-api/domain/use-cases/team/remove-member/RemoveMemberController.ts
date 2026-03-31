import { Controller, HttpRequest, HttpResponse, ok, badRequest, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { RemoveMemberControllerSchemas } from "./RemoveMemberControllerSchemas";
import { RemoveMember } from "./RemoveMember";
import { z } from "zod";

interface RemoveMemberControllerTypes {
    Body:     RemoveMemberControllerSchemas.Input;
    Query:    null;
    Params:   null;
    Response: RemoveMember.Response;
}

export class RemoveMemberController implements Controller<RemoveMemberControllerTypes> {
    constructor(private readonly useCase: RemoveMember) {}

    async handle(request: HttpRequest<RemoveMemberControllerTypes>): Promise<HttpResponse<RemoveMember.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const body = RemoveMemberControllerSchemas.Body.parse(request.body);

            const result = await this.useCase.execute(body);

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error.message?.includes("proprietário")) return badRequest(error);
            if (error.message?.includes("não encontrado")) return badRequest(error);
            return serverError(error);
        }
    }
}
