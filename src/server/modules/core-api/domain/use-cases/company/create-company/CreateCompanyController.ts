import { badRequest, Controller, HttpRequest, HttpResponse, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { CreateCompany } from "./CreateCompany";
import { CreateCompanyControllerSchemas } from "./CreateCompanyControllerSchemas";

interface CreateCompanyControllerTypes {
    Body: CreateCompanyControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: CreateCompany.Response;
}

export class CreateCompanyController implements Controller<CreateCompanyControllerTypes> {
    constructor(private readonly useCase: CreateCompany) {}

    async handle(request: HttpRequest<CreateCompanyControllerTypes>): Promise<HttpResponse<CreateCompany.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const body = CreateCompanyControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                ...body,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error.message?.includes("já cadastrada")) return badRequest(error);
            if (error.message?.includes("acesso")) return unauthorized(error);
            return serverError(error);
        }
    }
}
