import { z } from "zod";
import { Controller, HttpRequest, HttpResponse, badRequest, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { CreateCompanyWorkflowTransition } from "./CreateCompanyWorkflowTransition";
import { CreateCompanyWorkflowTransitionControllerSchemas } from "./CreateCompanyWorkflowTransitionControllerSchemas";

interface CreateCompanyWorkflowTransitionControllerTypes {
    Body: CreateCompanyWorkflowTransitionControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: CreateCompanyWorkflowTransition.Response;
}

export class CreateCompanyWorkflowTransitionController implements Controller<CreateCompanyWorkflowTransitionControllerTypes> {
    constructor(private readonly useCase: CreateCompanyWorkflowTransition) {}

    async handle(
        request: HttpRequest<CreateCompanyWorkflowTransitionControllerTypes>,
    ): Promise<HttpResponse<CreateCompanyWorkflowTransition.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const body = CreateCompanyWorkflowTransitionControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                ...body,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                return badRequest(new Error(error.message));
            }

            return serverError(error as Error);
        }
    }
}
