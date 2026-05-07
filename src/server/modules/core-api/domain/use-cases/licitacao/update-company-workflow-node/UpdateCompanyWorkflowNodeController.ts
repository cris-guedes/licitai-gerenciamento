import { z } from "zod";
import { Controller, HttpRequest, HttpResponse, badRequest, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { UpdateCompanyWorkflowNode } from "./UpdateCompanyWorkflowNode";
import { UpdateCompanyWorkflowNodeControllerSchemas } from "./UpdateCompanyWorkflowNodeControllerSchemas";

interface UpdateCompanyWorkflowNodeControllerTypes {
    Body: UpdateCompanyWorkflowNodeControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: UpdateCompanyWorkflowNode.Response;
}

export class UpdateCompanyWorkflowNodeController implements Controller<UpdateCompanyWorkflowNodeControllerTypes> {
    constructor(private readonly useCase: UpdateCompanyWorkflowNode) {}

    async handle(
        request: HttpRequest<UpdateCompanyWorkflowNodeControllerTypes>,
    ): Promise<HttpResponse<UpdateCompanyWorkflowNode.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const body = UpdateCompanyWorkflowNodeControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                companyId: body.companyId,
                workflowDefinitionId: body.workflowDefinitionId,
                nodeId: body.nodeId,
                label: body.label,
                description: body.description,
                color: body.color,
                isInitial: body.isInitial,
                isTerminal: body.isTerminal,
                order: body.order,
                position: body.position,
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
