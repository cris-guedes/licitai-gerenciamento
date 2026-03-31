import { Controller, HttpRequest, HttpResponse, created, badRequest, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { CreateInviteControllerSchemas } from "./CreateInviteControllerSchemas";
import { CreateInvite } from "./CreateInvite";
import { z } from "zod";

interface CreateInviteControllerTypes {
    Body:     CreateInviteControllerSchemas.Input;
    Query:    null;
    Params:   null;
    Response: CreateInvite.Response;
}

export class CreateInviteController implements Controller<CreateInviteControllerTypes> {
    constructor(private readonly useCase: CreateInvite) {}

    async handle(request: HttpRequest<CreateInviteControllerTypes>): Promise<HttpResponse<CreateInvite.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const body = CreateInviteControllerSchemas.Body.parse(request.body);

            const result = await this.useCase.execute({
                ...body,
                createdById: request.user.id,
            });

            return created(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            return serverError(error);
        }
    }
}
