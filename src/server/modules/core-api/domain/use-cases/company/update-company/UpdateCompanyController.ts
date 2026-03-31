import { badRequest, Controller, HttpRequest, HttpResponse, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { UpdateCompany } from "./UpdateCompany";
import { UpdateCompanyControllerSchemas } from "./UpdateCompanyControllerSchemas";

interface UpdateCompanyControllerTypes {
    Body: UpdateCompanyControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: UpdateCompany.Response;
}

export class UpdateCompanyController implements Controller<UpdateCompanyControllerTypes> {
    constructor(private readonly useCase: UpdateCompany) {}

    async handle(request: HttpRequest<UpdateCompanyControllerTypes>): Promise<HttpResponse<UpdateCompany.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const body = UpdateCompanyControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                ...body,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error.message?.includes("não encontrada")) return badRequest(error);
            if (error.message?.includes("já cadastrada")) return badRequest(error);
            if (error.message?.includes("acesso")) return unauthorized(error);
            return serverError(error);
        }
    }
}
