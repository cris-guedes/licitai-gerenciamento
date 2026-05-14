import { Controller, HttpRequest, HttpResponse, ok, serverError, badRequest } from "@/server/modules/core-api/main/adapters/http-adapter";
import { CreateLocalEntregaControllerSchemas } from "./CreateLocalEntregaControllerSchemas";
import { CreateLocalEntrega } from "./CreateLocalEntrega";
import { z } from "zod";

interface CreateLocalEntregaControllerTypes {
    Body: CreateLocalEntregaControllerSchemas.Input;
    Query: undefined;
    Params: undefined;
    Response: CreateLocalEntrega.Response;
}

export class CreateLocalEntregaController implements Controller<CreateLocalEntregaControllerTypes> {
    constructor(private readonly useCase: CreateLocalEntrega) { }

    async handle(request: HttpRequest<CreateLocalEntregaControllerTypes>): Promise<HttpResponse<CreateLocalEntrega.Response>> {
        try {
            const body = CreateLocalEntregaControllerSchemas.Body.parse(request.body);

            const result = await this.useCase.execute({
                ...body,
            });

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            return serverError(error);
        }
    }
}
