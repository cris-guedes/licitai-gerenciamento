/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, HttpRequest, HttpResponse, ok, serverError, badRequest } from "@/server/modules/core-api/main/adapters/http-adapter";
import { CreateEntregaControllerSchemas } from "./CreateEntregaControllerSchemas";
import { CreateEntrega } from "./CreateEntrega";
import { z } from "zod";

interface CreateEntregaControllerTypes {
    Body: CreateEntregaControllerSchemas.Input;
    Query: undefined;
    Params: undefined;
    Response: CreateEntrega.Response;
}

export class CreateEntregaController implements Controller<CreateEntregaControllerTypes> {
    constructor(private readonly useCase: CreateEntrega) { }

    async handle(request: HttpRequest<CreateEntregaControllerTypes>): Promise<HttpResponse<CreateEntrega.Response>> {
        try {
            const body = CreateEntregaControllerSchemas.Body.parse(request.body);

            const result = await this.useCase.execute({
                ...body,
            });

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error.statusCode === 400) return badRequest(new Error(error.message));
            return serverError(error);
        }
    }
}
