import { z } from "zod";
import { Controller, HttpRequest, HttpResponse, badRequest, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { DeleteCompanyWorkflowNode } from "./DeleteCompanyWorkflowNode";
import { DeleteCompanyWorkflowNodeControllerSchemas } from "./DeleteCompanyWorkflowNodeControllerSchemas";

interface DeleteCompanyWorkflowNodeControllerTypes {
    Body: DeleteCompanyWorkflowNodeControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: DeleteCompanyWorkflowNode.Response;
}

export class DeleteCompanyWorkflowNodeController implements Controller<DeleteCompanyWorkflowNodeControllerTypes> {
    constructor(private readonly useCase: DeleteCompanyWorkflowNode) {}

    async handle(
        request: HttpRequest<DeleteCompanyWorkflowNodeControllerTypes>,
    ): Promise<HttpResponse<DeleteCompanyWorkflowNode.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const body = DeleteCompanyWorkflowNodeControllerSchemas.Body.parse(request.body);
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
