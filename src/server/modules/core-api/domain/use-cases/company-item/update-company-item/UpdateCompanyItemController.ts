import { badRequest, Controller, HttpRequest, HttpResponse, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { UpdateCompanyItem } from "./UpdateCompanyItem";
import { UpdateCompanyItemControllerSchemas } from "./UpdateCompanyItemControllerSchemas";

interface UpdateCompanyItemControllerTypes {
    Body: UpdateCompanyItemControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: UpdateCompanyItem.Response;
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "";
}

export class UpdateCompanyItemController implements Controller<UpdateCompanyItemControllerTypes> {
    constructor(private readonly useCase: UpdateCompanyItem) {}

    async handle(request: HttpRequest<UpdateCompanyItemControllerTypes>): Promise<HttpResponse<UpdateCompanyItem.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const body = UpdateCompanyItemControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                ...body,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            const message = getErrorMessage(error);
            if (error instanceof Error && message.includes("Já existe")) return badRequest(error);
            if (error instanceof Error && message.includes("não encontrado")) return badRequest(error);
            if (error instanceof Error && message.includes("Empresa não encontrada")) return badRequest(error);
            if (error instanceof Error && message.includes("acesso")) return unauthorized(error);
            return serverError(error instanceof Error ? error : new Error("Unexpected error"));
        }
    }
}
