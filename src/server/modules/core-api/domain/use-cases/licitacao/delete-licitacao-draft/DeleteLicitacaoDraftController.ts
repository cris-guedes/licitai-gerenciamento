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
import { DeleteLicitacaoDraft } from "./DeleteLicitacaoDraft";
import { DeleteLicitacaoDraftControllerSchemas } from "./DeleteLicitacaoDraftControllerSchemas";

interface DeleteLicitacaoDraftControllerTypes {
    Body: DeleteLicitacaoDraftControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: DeleteLicitacaoDraft.Response;
}

export class DeleteLicitacaoDraftController implements Controller<DeleteLicitacaoDraftControllerTypes> {
    constructor(private readonly useCase: DeleteLicitacaoDraft) {}

    async handle(
        request: HttpRequest<DeleteLicitacaoDraftControllerTypes>,
    ): Promise<HttpResponse<DeleteLicitacaoDraft.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const body = DeleteLicitacaoDraftControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                companyId: body.companyId,
                oportunidadeId: body.oportunidadeId,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error instanceof Error && error.message.includes("não encontrado")) return notFound(error);
            if (error instanceof Error && error.message.includes("acesso")) return unauthorized(error);
            return serverError(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
