import { z } from "zod";
import { Controller, HttpRequest, HttpResponse, badRequest, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { GetCompanyWorkflow } from "./GetCompanyWorkflow";
import { GetCompanyWorkflowControllerSchemas } from "./GetCompanyWorkflowControllerSchemas";

interface GetCompanyWorkflowControllerTypes {
    Body: null;
    Query: GetCompanyWorkflowControllerSchemas.Input;
    Params: null;
    Response: GetCompanyWorkflow.Response;
}

export class GetCompanyWorkflowController implements Controller<GetCompanyWorkflowControllerTypes> {
    constructor(private readonly useCase: GetCompanyWorkflow) {}

    async handle(
        request: HttpRequest<GetCompanyWorkflowControllerTypes>,
    ): Promise<HttpResponse<GetCompanyWorkflow.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const query = GetCompanyWorkflowControllerSchemas.Query.parse(request.query);
            const result = await this.useCase.execute({
                companyId: query.companyId,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                return badRequest(new Error(error.message));
            }

            if (error instanceof Error && error.message.includes("não encontrado")) {
                return badRequest(error);
            }

            return serverError(error as Error);
        }
    }
}
