import { badRequest, Controller, HttpRequest, HttpResponse, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { CreateCompanyItem } from "./CreateCompanyItem";
import { CreateCompanyItemControllerSchemas } from "./CreateCompanyItemControllerSchemas";

interface CreateCompanyItemControllerTypes {
    Body: CreateCompanyItemControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: CreateCompanyItem.Response;
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "";
}

export class CreateCompanyItemController implements Controller<CreateCompanyItemControllerTypes> {
    constructor(private readonly useCase: CreateCompanyItem) {}

    async handle(request: HttpRequest<CreateCompanyItemControllerTypes>): Promise<HttpResponse<CreateCompanyItem.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const body = CreateCompanyItemControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                ...body,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            const message = getErrorMessage(error);
            if (error instanceof Error && message.includes("Já existe")) return badRequest(error);
            if (error instanceof Error && message.includes("Empresa não encontrada")) return badRequest(error);
            if (error instanceof Error && message.includes("acesso")) return unauthorized(error);
            return serverError(error instanceof Error ? error : new Error("Unexpected error"));
        }
    }
}
