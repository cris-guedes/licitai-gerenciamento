import { Controller, HttpRequest, HttpResponse, created, badRequest, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { CreateMemberControllerSchemas } from "./CreateMemberControllerSchemas";
import { CreateMember } from "./CreateMember";
import { z } from "zod";

interface CreateMemberControllerTypes {
    Body:     CreateMemberControllerSchemas.Input;
    Query:    null;
    Params:   null;
    Response: CreateMember.Response;
}

export class CreateMemberController implements Controller<CreateMemberControllerTypes> {
    constructor(private readonly useCase: CreateMember) {}

    async handle(request: HttpRequest<CreateMemberControllerTypes>): Promise<HttpResponse<CreateMember.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const body = CreateMemberControllerSchemas.Body.parse(request.body);

            const result = await this.useCase.execute(body);

            return created(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error.message?.includes("já está em uso")) return badRequest(error);
            return serverError(error);
        }
    }
}
