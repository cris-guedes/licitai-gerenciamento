import { Controller, HttpRequest, HttpResponse, ok, serverError, badRequest } from "@/server/modules/core-api/main/adapters/http-adapter";
import { ListEmpenhosControllerSchemas } from "./ListEmpenhosControllerSchemas";
import { ListEmpenhos } from "./ListEmpenhos";
import { z } from "zod";

interface ListEmpenhosControllerTypes {
    Body: undefined;
    Query: ListEmpenhosControllerSchemas.Input;
    Params: undefined;
    Response: ListEmpenhos.Response;
}

export class ListEmpenhosController implements Controller<ListEmpenhosControllerTypes> {
    constructor(private readonly useCase: ListEmpenhos) { }

    async handle(request: HttpRequest<ListEmpenhosControllerTypes>): Promise<HttpResponse<ListEmpenhos.Response>> {
        try {
            const input = ListEmpenhosControllerSchemas.Query.parse(request.query);
            const companyId = input.companyId;

            const result = await this.useCase.execute({
                contratoId: input.contratoId,
                companyId,
            });

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            
            if (error.statusCode === 404) {
                return { statusCode: 404, data: { message: error.message } as any };
            }

            return serverError(error);
        }
    }
}

export namespace ListEmpenhosController {
    export type Types = ListEmpenhosControllerTypes;
    export type Params = ListEmpenhosControllerTypes['Params'];
    export type Response = ListEmpenhosControllerTypes['Response'];
}
