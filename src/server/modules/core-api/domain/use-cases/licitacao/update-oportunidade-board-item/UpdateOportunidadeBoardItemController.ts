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
import { UpdateOportunidadeBoardItem } from "./UpdateOportunidadeBoardItem";
import { UpdateOportunidadeBoardItemControllerSchemas } from "./UpdateOportunidadeBoardItemControllerSchemas";

interface UpdateOportunidadeBoardItemControllerTypes {
    Body: UpdateOportunidadeBoardItemControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: UpdateOportunidadeBoardItem.Response;
}

export class UpdateOportunidadeBoardItemController implements Controller<UpdateOportunidadeBoardItemControllerTypes> {
    constructor(private readonly useCase: UpdateOportunidadeBoardItem) {}

    async handle(
        request: HttpRequest<UpdateOportunidadeBoardItemControllerTypes>,
    ): Promise<HttpResponse<UpdateOportunidadeBoardItem.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const body = UpdateOportunidadeBoardItemControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                companyId: body.companyId,
                oportunidadeId: body.oportunidadeId,
                responsavelUserId: body.responsavelUserId,
                phaseNodeId: body.phaseNodeId,
                statusNodeId: body.statusNodeId,
                situationNodeId: body.situationNodeId,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error instanceof Error && error.message.includes("não encontrad")) return notFound(error);
            if (error instanceof Error && error.message.includes("acesso")) return unauthorized(error);
            return serverError(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
