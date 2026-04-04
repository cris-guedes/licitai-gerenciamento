import { badRequest, Controller, HttpRequest, HttpResponse, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { CreateLicitacao } from "./CreateLicitacao";
import { CreateLicitacaoControllerSchemas } from "./CreateLicitacaoControllerSchemas";

interface CreateLicitacaoControllerTypes {
    Body:     CreateLicitacaoControllerSchemas.Input;
    Query:    null;
    Params:   null;
    Response: CreateLicitacao.Response;
}

export class CreateLicitacaoController implements Controller<CreateLicitacaoControllerTypes> {
    constructor(private readonly useCase: CreateLicitacao) {}

    async handle(request: HttpRequest<CreateLicitacaoControllerTypes>): Promise<HttpResponse<CreateLicitacao.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const body = CreateLicitacaoControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                ...body,
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
