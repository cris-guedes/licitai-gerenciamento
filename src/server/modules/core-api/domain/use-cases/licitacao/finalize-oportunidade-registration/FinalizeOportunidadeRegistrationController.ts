import {
    badRequest,
    Controller,
    HttpRequest,
    HttpResponse,
    notFound,
    ok,
    serverError,
    unauthorized,
} from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { FinalizeOportunidadeRegistration } from "./FinalizeOportunidadeRegistration";
import { FinalizeOportunidadeRegistrationControllerSchemas } from "./FinalizeOportunidadeRegistrationControllerSchemas";

interface FinalizeOportunidadeRegistrationControllerTypes {
    Body: FinalizeOportunidadeRegistrationControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: FinalizeOportunidadeRegistration.Response;
}

export class FinalizeOportunidadeRegistrationController implements Controller<FinalizeOportunidadeRegistrationControllerTypes> {
    constructor(private readonly useCase: FinalizeOportunidadeRegistration) {}

    async handle(
        request: HttpRequest<FinalizeOportunidadeRegistrationControllerTypes>,
    ): Promise<HttpResponse<FinalizeOportunidadeRegistration.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const body = FinalizeOportunidadeRegistrationControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                companyId: body.companyId,
                oportunidadeId: body.oportunidadeId,
                form: body.form,
                userId: request.user.id,
                createdById: request.user.id,
            });

            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error instanceof Error && error.message.includes("não encontrado")) return notFound(error);
            if (error instanceof Error && error.message.includes("acesso")) return unauthorized(error);
            return serverError(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
