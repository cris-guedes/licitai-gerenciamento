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
import { DeleteOportunidadeTask } from "./DeleteOportunidadeTask";
import { DeleteOportunidadeTaskControllerSchemas } from "./DeleteOportunidadeTaskControllerSchemas";

interface DeleteOportunidadeTaskControllerTypes {
    Body: DeleteOportunidadeTaskControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: DeleteOportunidadeTask.Response;
}

export class DeleteOportunidadeTaskController implements Controller<DeleteOportunidadeTaskControllerTypes> {
    constructor(private readonly useCase: DeleteOportunidadeTask) {}

    async handle(
        request: HttpRequest<DeleteOportunidadeTaskControllerTypes>,
    ): Promise<HttpResponse<DeleteOportunidadeTask.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const body = DeleteOportunidadeTaskControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                companyId: body.companyId,
                oportunidadeId: body.oportunidadeId,
                taskId: body.taskId,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error instanceof Error && error.message.includes("não encontrad")) return notFound(error);
            if (error instanceof Error && error.message.includes("acesso")) return unauthorized(error);
            if (error instanceof Error && error.message.includes("Somente")) return badRequest(error);
            return serverError(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
