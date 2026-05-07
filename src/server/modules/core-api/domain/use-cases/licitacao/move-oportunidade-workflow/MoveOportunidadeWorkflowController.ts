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
import { MoveOportunidadeWorkflow } from "./MoveOportunidadeWorkflow";
import { MoveOportunidadeWorkflowControllerSchemas } from "./MoveOportunidadeWorkflowControllerSchemas";

interface MoveOportunidadeWorkflowControllerTypes {
    Body: MoveOportunidadeWorkflowControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: MoveOportunidadeWorkflow.Response;
}

export class MoveOportunidadeWorkflowController implements Controller<MoveOportunidadeWorkflowControllerTypes> {
    constructor(private readonly useCase: MoveOportunidadeWorkflow) {}

    async handle(
        request: HttpRequest<MoveOportunidadeWorkflowControllerTypes>,
    ): Promise<HttpResponse<MoveOportunidadeWorkflow.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const body = MoveOportunidadeWorkflowControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                companyId: body.companyId,
                oportunidadeId: body.oportunidadeId,
                targetNodeId: body.targetNodeId,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error instanceof Error && error.message.includes("não encontrada")) return notFound(error);
            if (error instanceof Error && (error.message.includes("acesso") || error.message.includes("responsável"))) return unauthorized(error);
            return serverError(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
