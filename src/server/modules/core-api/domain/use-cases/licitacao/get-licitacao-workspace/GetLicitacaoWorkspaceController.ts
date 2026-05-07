import { z } from "zod";
import { Controller, HttpRequest, HttpResponse, badRequest, notFound, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { GetLicitacaoWorkspace } from "./GetLicitacaoWorkspace";
import { GetLicitacaoWorkspaceControllerSchemas } from "./GetLicitacaoWorkspaceControllerSchemas";

interface GetLicitacaoWorkspaceControllerTypes {
    Body: null;
    Query: GetLicitacaoWorkspaceControllerSchemas.Input;
    Params: null;
    Response: Exclude<GetLicitacaoWorkspace.Response, null>;
}

export class GetLicitacaoWorkspaceController implements Controller<GetLicitacaoWorkspaceControllerTypes> {
    constructor(private readonly useCase: GetLicitacaoWorkspace) {}

    async handle(
        request: HttpRequest<GetLicitacaoWorkspaceControllerTypes>,
    ): Promise<HttpResponse<GetLicitacaoWorkspaceControllerTypes["Response"]>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const query = GetLicitacaoWorkspaceControllerSchemas.Query.parse(request.query);
            const result = await this.useCase.execute({
                companyId: query.companyId,
                oportunidadeId: query.oportunidadeId,
                userId: request.user.id,
            });

            if (!result) {
                return notFound(new Error("Licitação em andamento não encontrada."));
            }

            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                return badRequest(new Error(error.message));
            }

            return serverError(error as Error);
        }
    }
}
