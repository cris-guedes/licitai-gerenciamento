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
import { ToggleOportunidadeTask } from "./ToggleOportunidadeTask";
import { ToggleOportunidadeTaskControllerSchemas } from "./ToggleOportunidadeTaskControllerSchemas";

interface ToggleOportunidadeTaskControllerTypes {
    Body: ToggleOportunidadeTaskControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: ToggleOportunidadeTask.Response;
}

export class ToggleOportunidadeTaskController implements Controller<ToggleOportunidadeTaskControllerTypes> {
    constructor(private readonly useCase: ToggleOportunidadeTask) {}

    async handle(
        request: HttpRequest<ToggleOportunidadeTaskControllerTypes>,
    ): Promise<HttpResponse<ToggleOportunidadeTask.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const body = ToggleOportunidadeTaskControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                companyId: body.companyId,
                oportunidadeId: body.oportunidadeId,
                taskId: body.taskId,
                status: body.status,
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
