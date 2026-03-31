import { badRequest, Controller, HttpRequest, HttpResponse, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { ListCompanies } from "./ListCompanies";
import { ListCompaniesControllerSchemas } from "./ListCompaniesControllerSchemas";

interface ListCompaniesControllerTypes {
    Body: null;
    Query: ListCompaniesControllerSchemas.Input;
    Params: null;
    Response: ListCompanies.Response;
}

export class ListCompaniesController implements Controller<ListCompaniesControllerTypes> {
    constructor(private readonly useCase: ListCompanies) {}

    async handle(request: HttpRequest<ListCompaniesControllerTypes>): Promise<HttpResponse<ListCompanies.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const query = ListCompaniesControllerSchemas.Query.parse(request.query);
            const result = await this.useCase.execute({
                ...query,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error.message?.includes("acesso")) return unauthorized(error);
            return serverError(error);
        }
    }
}
