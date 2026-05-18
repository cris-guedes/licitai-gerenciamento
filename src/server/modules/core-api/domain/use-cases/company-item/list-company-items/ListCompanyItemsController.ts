import { badRequest, Controller, HttpRequest, HttpResponse, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { ListCompanyItems } from "./ListCompanyItems";
import { ListCompanyItemsControllerSchemas } from "./ListCompanyItemsControllerSchemas";

interface ListCompanyItemsControllerTypes {
    Body: null;
    Query: ListCompanyItemsControllerSchemas.Input;
    Params: null;
    Response: ListCompanyItems.Response;
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "";
}

export class ListCompanyItemsController implements Controller<ListCompanyItemsControllerTypes> {
    constructor(private readonly useCase: ListCompanyItems) {}

    async handle(request: HttpRequest<ListCompanyItemsControllerTypes>): Promise<HttpResponse<ListCompanyItems.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const query = ListCompanyItemsControllerSchemas.Query.parse(request.query);
            const result = await this.useCase.execute({
                ...query,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            const message = getErrorMessage(error);
            if (error instanceof Error && message.includes("Empresa não encontrada")) return badRequest(error);
            if (error instanceof Error && message.includes("acesso")) return unauthorized(error);
            return serverError(error instanceof Error ? error : new Error("Unexpected error"));
        }
    }
}
