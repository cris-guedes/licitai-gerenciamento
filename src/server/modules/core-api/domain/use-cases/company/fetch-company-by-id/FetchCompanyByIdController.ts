import { badRequest, Controller, HttpRequest, HttpResponse, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { FetchCompanyById } from "./FetchCompanyById";
import { FetchCompanyByIdControllerSchemas } from "./FetchCompanyByIdControllerSchemas";

interface FetchCompanyByIdControllerTypes {
    Body: null;
    Query: FetchCompanyByIdControllerSchemas.Input;
    Params: null;
    Response: FetchCompanyById.Response;
}

export class FetchCompanyByIdController implements Controller<FetchCompanyByIdControllerTypes> {
    constructor(private readonly useCase: FetchCompanyById) {}

    async handle(request: HttpRequest<FetchCompanyByIdControllerTypes>): Promise<HttpResponse<FetchCompanyById.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const query = FetchCompanyByIdControllerSchemas.Query.parse(request.query);
            const result = await this.useCase.execute({
                ...query,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error.message?.includes("não encontrada")) return badRequest(error);
            if (error.message?.includes("acesso")) return unauthorized(error);
            return serverError(error);
        }
    }
}
