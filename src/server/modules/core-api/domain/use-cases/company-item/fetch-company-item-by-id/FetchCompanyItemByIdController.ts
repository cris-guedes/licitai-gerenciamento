import { badRequest, Controller, HttpRequest, HttpResponse, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { FetchCompanyItemById } from "./FetchCompanyItemById";
import { FetchCompanyItemByIdControllerSchemas } from "./FetchCompanyItemByIdControllerSchemas";

interface FetchCompanyItemByIdControllerTypes {
    Body: null;
    Query: FetchCompanyItemByIdControllerSchemas.Input;
    Params: null;
    Response: FetchCompanyItemById.Response;
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "";
}

export class FetchCompanyItemByIdController implements Controller<FetchCompanyItemByIdControllerTypes> {
    constructor(private readonly useCase: FetchCompanyItemById) {}

    async handle(request: HttpRequest<FetchCompanyItemByIdControllerTypes>): Promise<HttpResponse<FetchCompanyItemById.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const query = FetchCompanyItemByIdControllerSchemas.Query.parse(request.query);
            const result = await this.useCase.execute({
                ...query,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            const message = getErrorMessage(error);
            if (error instanceof Error && message.includes("não encontrado")) return badRequest(error);
            if (error instanceof Error && message.includes("Empresa não encontrada")) return badRequest(error);
            if (error instanceof Error && message.includes("acesso")) return unauthorized(error);
            return serverError(error instanceof Error ? error : new Error("Unexpected error"));
        }
    }
}
