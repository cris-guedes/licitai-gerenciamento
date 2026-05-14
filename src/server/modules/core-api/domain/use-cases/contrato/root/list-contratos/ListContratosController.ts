import { Controller, HttpRequest, HttpResponse, ok, serverError, badRequest } from "@/server/modules/core-api/main/adapters/http-adapter";
import { ListContratosControllerSchemas } from "./ListContratosControllerSchemas";
import { ListContratos } from "./ListContratos";
import { z } from "zod";

interface ListContratosControllerTypes {
    Body: undefined;
    Query: ListContratosControllerSchemas.Input;
    Params: undefined;
    Response: ListContratos.Response;
}

export class ListContratosController implements Controller<ListContratosControllerTypes> {
    constructor(private readonly useCase: ListContratos) { }

    async handle(request: HttpRequest<ListContratosControllerTypes>): Promise<HttpResponse<ListContratos.Response>> {
        try {
            const query = ListContratosControllerSchemas.Query.parse(request.query);

            const result = await this.useCase.execute({
                ...query,
            });

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            return serverError(error);
        }
    }
}

export namespace ListContratosController {
    export type Types = ListContratosControllerTypes;
    export type Query = ListContratosControllerTypes['Query'];
    export type Response = ListContratosControllerTypes['Response'];
}
