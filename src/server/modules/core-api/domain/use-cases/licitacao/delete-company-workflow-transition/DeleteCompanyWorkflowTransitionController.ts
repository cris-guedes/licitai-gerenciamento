import { z } from "zod";
import { Controller, HttpRequest, HttpResponse, badRequest, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { DeleteCompanyWorkflowTransition } from "./DeleteCompanyWorkflowTransition";
import { DeleteCompanyWorkflowTransitionControllerSchemas } from "./DeleteCompanyWorkflowTransitionControllerSchemas";

interface DeleteCompanyWorkflowTransitionControllerTypes {
    Body: DeleteCompanyWorkflowTransitionControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: DeleteCompanyWorkflowTransition.Response;
}

export class DeleteCompanyWorkflowTransitionController implements Controller<DeleteCompanyWorkflowTransitionControllerTypes> {
    constructor(private readonly useCase: DeleteCompanyWorkflowTransition) {}

    async handle(
        request: HttpRequest<DeleteCompanyWorkflowTransitionControllerTypes>,
    ): Promise<HttpResponse<DeleteCompanyWorkflowTransition.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const body = DeleteCompanyWorkflowTransitionControllerSchemas.Body.parse(request.body);
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
