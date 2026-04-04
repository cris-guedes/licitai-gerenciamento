import { badRequest, Controller, HttpRequest, HttpResponse, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { ListLicitacoes } from "./ListLicitacoes";
import { ListLicitacoesControllerSchemas } from "./ListLicitacoesControllerSchemas";

interface ListLicitacoesControllerTypes {
    Body:     null;
    Query:    ListLicitacoesControllerSchemas.Input;
    Params:   null;
    Response: ListLicitacoes.Response;
}

export class ListLicitacoesController implements Controller<ListLicitacoesControllerTypes> {
    constructor(private readonly useCase: ListLicitacoes) {}

    async handle(request: HttpRequest<ListLicitacoesControllerTypes>): Promise<HttpResponse<ListLicitacoes.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const query = ListLicitacoesControllerSchemas.Query.parse(request.query);
            const result = await this.useCase.execute({
                ...query,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error.message?.includes("acesso")) return unauthorized(error);
            return serverError(error);
        }
    }
}
