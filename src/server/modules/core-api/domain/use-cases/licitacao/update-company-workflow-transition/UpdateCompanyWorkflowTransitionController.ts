import { z } from "zod";
import { Controller, HttpRequest, HttpResponse, badRequest, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { UpdateCompanyWorkflowTransition } from "./UpdateCompanyWorkflowTransition";
import { UpdateCompanyWorkflowTransitionControllerSchemas } from "./UpdateCompanyWorkflowTransitionControllerSchemas";

interface UpdateCompanyWorkflowTransitionControllerTypes {
    Body: UpdateCompanyWorkflowTransitionControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: UpdateCompanyWorkflowTransition.Response;
}

export class UpdateCompanyWorkflowTransitionController implements Controller<UpdateCompanyWorkflowTransitionControllerTypes> {
    constructor(private readonly useCase: UpdateCompanyWorkflowTransition) {}

    async handle(
        request: HttpRequest<UpdateCompanyWorkflowTransitionControllerTypes>,
    ): Promise<HttpResponse<UpdateCompanyWorkflowTransition.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const body = UpdateCompanyWorkflowTransitionControllerSchemas.Body.parse(request.body);
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
