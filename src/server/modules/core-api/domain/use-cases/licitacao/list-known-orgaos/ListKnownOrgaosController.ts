import { z } from "zod";
import { Controller, HttpRequest, HttpResponse, badRequest, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { ListKnownOrgaos } from "./ListKnownOrgaos";
import { ListKnownOrgaosControllerSchemas } from "./ListKnownOrgaosControllerSchemas";

interface ListKnownOrgaosControllerTypes {
    Body: null;
    Query: ListKnownOrgaosControllerSchemas.Input;
    Params: null;
    Response: ListKnownOrgaos.Response;
}

export class ListKnownOrgaosController implements Controller<ListKnownOrgaosControllerTypes> {
    constructor(private readonly useCase: ListKnownOrgaos) {}

    async handle(
        request: HttpRequest<ListKnownOrgaosControllerTypes>,
    ): Promise<HttpResponse<ListKnownOrgaos.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const query = ListKnownOrgaosControllerSchemas.Query.parse(request.query);
            const result = await this.useCase.execute({
                companyId: query.companyId,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                return badRequest(new Error(error.message));
            }

            if (error instanceof Error && error.message.includes("acesso")) {
                return unauthorized(error);
            }

            return serverError(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
