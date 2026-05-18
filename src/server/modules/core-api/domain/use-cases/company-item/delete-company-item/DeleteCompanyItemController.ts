import { badRequest, Controller, HttpRequest, HttpResponse, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { DeleteCompanyItem } from "./DeleteCompanyItem";
import { DeleteCompanyItemControllerSchemas } from "./DeleteCompanyItemControllerSchemas";

interface DeleteCompanyItemControllerTypes {
    Body: DeleteCompanyItemControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: DeleteCompanyItem.Response;
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "";
}

export class DeleteCompanyItemController implements Controller<DeleteCompanyItemControllerTypes> {
    constructor(private readonly useCase: DeleteCompanyItem) {}

    async handle(request: HttpRequest<DeleteCompanyItemControllerTypes>): Promise<HttpResponse<DeleteCompanyItem.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const body = DeleteCompanyItemControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                ...body,
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
