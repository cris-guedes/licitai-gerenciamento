import { z } from "zod";
import { Controller, HttpRequest, HttpResponse, badRequest, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { ListLicitacaoDrafts } from "./ListLicitacaoDrafts";
import { ListLicitacaoDraftsControllerSchemas } from "./ListLicitacaoDraftsControllerSchemas";

interface ListLicitacaoDraftsControllerTypes {
    Body: null;
    Query: ListLicitacaoDraftsControllerSchemas.Input;
    Params: null;
    Response: ListLicitacaoDrafts.Response;
}

export class ListLicitacaoDraftsController implements Controller<ListLicitacaoDraftsControllerTypes> {
    constructor(private readonly useCase: ListLicitacaoDrafts) {}

    async handle(
        request: HttpRequest<ListLicitacaoDraftsControllerTypes>,
    ): Promise<HttpResponse<ListLicitacaoDrafts.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const query = ListLicitacaoDraftsControllerSchemas.Query.parse(request.query);
            const result = await this.useCase.execute({
                companyId: query.companyId,
                userId: request.user.id,
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
