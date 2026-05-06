import { z } from "zod";
import { Controller, HttpRequest, HttpResponse, badRequest, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { ListOportunidadesBoard } from "./ListOportunidadesBoard";
import { ListOportunidadesBoardControllerSchemas } from "./ListOportunidadesBoardControllerSchemas";

interface ListOportunidadesBoardControllerTypes {
    Body: null;
    Query: ListOportunidadesBoardControllerSchemas.Input;
    Params: null;
    Response: ListOportunidadesBoard.Response;
}

export class ListOportunidadesBoardController implements Controller<ListOportunidadesBoardControllerTypes> {
    constructor(private readonly useCase: ListOportunidadesBoard) {}

    async handle(
        request: HttpRequest<ListOportunidadesBoardControllerTypes>,
    ): Promise<HttpResponse<ListOportunidadesBoard.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const query = ListOportunidadesBoardControllerSchemas.Query.parse(request.query);
            const result = await this.useCase.execute({
                companyId: query.companyId,
                userId: request.user.id,
                currentPhaseNodeId: query.currentPhaseNodeId,
                currentStatusNodeId: query.currentStatusNodeId,
                currentSituationNodeId: query.currentSituationNodeId,
                responsavelUserId: query.responsavelUserId,
                q: query.q,
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
