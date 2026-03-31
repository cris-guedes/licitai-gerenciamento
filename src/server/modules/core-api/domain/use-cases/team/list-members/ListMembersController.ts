import { Controller, HttpRequest, HttpResponse, ok, badRequest, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { ListMembersControllerSchemas } from "./ListMembersControllerSchemas";
import { ListMembers } from "./ListMembers";
import { z } from "zod";

interface ListMembersControllerTypes {
    Body:     null;
    Query:    ListMembersControllerSchemas.Input;
    Params:   null;
    Response: ListMembers.Response;
}

export class ListMembersController implements Controller<ListMembersControllerTypes> {
    constructor(private readonly useCase: ListMembers) {}

    async handle(request: HttpRequest<ListMembersControllerTypes>): Promise<HttpResponse<ListMembers.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const query = ListMembersControllerSchemas.Query.parse(request.query);

            const result = await this.useCase.execute({
                organizationId: query.organizationId,
            });

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            return serverError(error);
        }
    }
}
