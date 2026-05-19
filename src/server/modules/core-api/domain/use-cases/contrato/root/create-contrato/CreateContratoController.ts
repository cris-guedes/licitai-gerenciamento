import { Controller, HttpRequest, HttpResponse, created, serverError, badRequest } from "@/server/modules/core-api/main/adapters/http-adapter";
import { CreateContratoControllerSchemas } from "./CreateContratoControllerSchemas";
import { CreateContrato } from "./CreateContrato";
import { z } from "zod";

interface CreateContratoControllerTypes {
    Body: CreateContratoControllerSchemas.Input;
    Query: undefined;
    Params: undefined;
    Response: CreateContrato.Response;
}

export class CreateContratoController implements Controller<CreateContratoControllerTypes> {
    constructor(private readonly useCase: CreateContrato) { }

    async handle(request: HttpRequest<CreateContratoControllerTypes>): Promise<HttpResponse<CreateContrato.Response>> {
        try {
            const parsedBody = CreateContratoControllerSchemas.Body.parse(request.body);

            const result = await this.useCase.execute({
                ...parsedBody,
                dataAssinatura: parsedBody.dataAssinatura ? new Date(parsedBody.dataAssinatura) : undefined,
                dataVigenciaInicio: parsedBody.dataVigenciaInicio ? new Date(parsedBody.dataVigenciaInicio) : undefined,
                dataVigenciaFim: parsedBody.dataVigenciaFim ? new Date(parsedBody.dataVigenciaFim) : undefined,
            });

            return created(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error.statusCode === 400) {
                return badRequest(new Error(error.message));
            }
            if (error.statusCode === 404) {
                return { statusCode: 404, data: { message: error.message } as any };
            }
            return serverError(error);
        }
    }
}

export namespace CreateContratoController {
    export type Types = CreateContratoControllerTypes;
    export type Body = CreateContratoControllerTypes['Body'];
    export type Response = CreateContratoControllerTypes['Response'];
}
