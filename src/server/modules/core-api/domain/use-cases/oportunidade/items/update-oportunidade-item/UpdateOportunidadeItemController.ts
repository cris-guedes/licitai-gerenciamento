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
import { UpdateOportunidadeItem } from "./UpdateOportunidadeItem";
import { UpdateOportunidadeItemControllerSchemas } from "./UpdateOportunidadeItemControllerSchemas";

interface UpdateOportunidadeItemControllerTypes {
    Body: UpdateOportunidadeItemControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: UpdateOportunidadeItem.Response;
}

export class UpdateOportunidadeItemController implements Controller<UpdateOportunidadeItemControllerTypes> {
    constructor(private readonly useCase: UpdateOportunidadeItem) {}

    async handle(
        request: HttpRequest<UpdateOportunidadeItemControllerTypes>,
    ): Promise<HttpResponse<UpdateOportunidadeItem.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const body = UpdateOportunidadeItemControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                companyId: body.companyId,
                oportunidadeId: body.oportunidadeId,
                oportunidadeItemId: body.oportunidadeItemId,
                data: body.data,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error instanceof Error && error.message.includes("não encontrad")) return notFound(error);
            if (error instanceof Error && error.message.includes("acesso")) return unauthorized(error);
            if (error instanceof Error && error.message.includes("inválid")) return badRequest(error);
            if (error instanceof Error && error.message.includes("Somente")) return badRequest(error);
            return serverError(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
