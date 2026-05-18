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
import { CreateOportunidadeTask } from "./CreateOportunidadeTask";
import { CreateOportunidadeTaskControllerSchemas } from "./CreateOportunidadeTaskControllerSchemas";

interface CreateOportunidadeTaskControllerTypes {
    Body: CreateOportunidadeTaskControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: CreateOportunidadeTask.Response;
}

export class CreateOportunidadeTaskController implements Controller<CreateOportunidadeTaskControllerTypes> {
    constructor(private readonly useCase: CreateOportunidadeTask) {}

    async handle(
        request: HttpRequest<CreateOportunidadeTaskControllerTypes>,
    ): Promise<HttpResponse<CreateOportunidadeTask.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const body = CreateOportunidadeTaskControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                companyId: body.companyId,
                oportunidadeId: body.oportunidadeId,
                title: body.title,
                dueAt: body.dueAt,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error instanceof Error && error.message.includes("não encontrad")) return notFound(error);
            if (error instanceof Error && error.message.includes("acesso")) return unauthorized(error);
            if (error instanceof Error && (error.message.includes("Somente") || error.message.includes("título") || error.message.includes("inválida"))) return badRequest(error);
            return serverError(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
