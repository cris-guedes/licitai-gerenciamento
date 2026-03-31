import { Controller, HttpRequest, HttpResponse, ok, badRequest, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { UpdateMemberRoleControllerSchemas } from "./UpdateMemberRoleControllerSchemas";
import { UpdateMemberRole } from "./UpdateMemberRole";
import { z } from "zod";

interface UpdateMemberRoleControllerTypes {
    Body:     UpdateMemberRoleControllerSchemas.Input;
    Query:    null;
    Params:   null;
    Response: UpdateMemberRole.Response;
}

export class UpdateMemberRoleController implements Controller<UpdateMemberRoleControllerTypes> {
    constructor(private readonly useCase: UpdateMemberRole) {}

    async handle(request: HttpRequest<UpdateMemberRoleControllerTypes>): Promise<HttpResponse<UpdateMemberRole.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const body = UpdateMemberRoleControllerSchemas.Body.parse(request.body);

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
