import { z } from "zod";
import { Controller, HttpRequest, HttpResponse, badRequest, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { CreateCompanyWorkflowNode } from "./CreateCompanyWorkflowNode";
import { CreateCompanyWorkflowNodeControllerSchemas } from "./CreateCompanyWorkflowNodeControllerSchemas";

interface CreateCompanyWorkflowNodeControllerTypes {
    Body: CreateCompanyWorkflowNodeControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: CreateCompanyWorkflowNode.Response;
}

export class CreateCompanyWorkflowNodeController implements Controller<CreateCompanyWorkflowNodeControllerTypes> {
    constructor(private readonly useCase: CreateCompanyWorkflowNode) {}

    async handle(
        request: HttpRequest<CreateCompanyWorkflowNodeControllerTypes>,
    ): Promise<HttpResponse<CreateCompanyWorkflowNode.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const body = CreateCompanyWorkflowNodeControllerSchemas.Body.parse(request.body);
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
