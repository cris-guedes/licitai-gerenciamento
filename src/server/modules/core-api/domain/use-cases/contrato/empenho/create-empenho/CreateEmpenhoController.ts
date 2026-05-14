import { Controller, HttpRequest, HttpResponse, created, serverError, badRequest } from "@/server/modules/core-api/main/adapters/http-adapter";
import { CreateEmpenhoControllerSchemas } from "./CreateEmpenhoControllerSchemas";
import { CreateEmpenho } from "./CreateEmpenho";
import { z } from "zod";

interface CreateEmpenhoControllerTypes {
    Body: CreateEmpenhoControllerSchemas.Input;
    Query: undefined;
    Params: undefined;
    Response: CreateEmpenho.Response;
}

export class CreateEmpenhoController implements Controller<CreateEmpenhoControllerTypes> {
    constructor(private readonly useCase: CreateEmpenho) { }

    async handle(request: HttpRequest<CreateEmpenhoControllerTypes>): Promise<HttpResponse<CreateEmpenho.Response>> {
        try {
            const parsedBody = CreateEmpenhoControllerSchemas.Body.parse(request.body);

            const result = await this.useCase.execute({
                ...parsedBody,
                dataEmissao: parsedBody.dataEmissao ? new Date(parsedBody.dataEmissao) : undefined,
            });

            return created(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            
            if (error.statusCode === 400 || error.statusCode === 404) {
                return { statusCode: error.statusCode, data: { message: error.message } as any };
            }

            return serverError(error);
        }
    }
}

export namespace CreateEmpenhoController {
    export type Types = CreateEmpenhoControllerTypes;
    export type Body = CreateEmpenhoControllerTypes['Body'];
    export type Response = CreateEmpenhoControllerTypes['Response'];
}
