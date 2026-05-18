import { Controller, HttpRequest, HttpResponse, ok, serverError, badRequest } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { UpdateContrato } from "./UpdateContrato";
import { UpdateContratoControllerSchemas } from "./UpdateContratoControllerSchemas";

interface UpdateContratoControllerTypes {
    Body: UpdateContratoControllerSchemas.Input;
    Query: undefined;
    Params: undefined;
    Response: UpdateContrato.Response;
}

function toDate(value: string | null | undefined): Date | null | undefined {
    if (value === undefined) return undefined;
    if (value === null || value === "") return null;
    return new Date(value);
}

export class UpdateContratoController implements Controller<UpdateContratoControllerTypes> {
    constructor(private readonly useCase: UpdateContrato) {}

    async handle(request: HttpRequest<UpdateContratoControllerTypes>): Promise<HttpResponse<UpdateContrato.Response>> {
        try {
            const parsedBody = UpdateContratoControllerSchemas.Body.parse(request.body);

            const result = await this.useCase.execute({
                ...parsedBody,
                dataAssinatura: toDate(parsedBody.dataAssinatura),
                dataVigenciaInicio: toDate(parsedBody.dataVigenciaInicio),
                dataVigenciaFim: toDate(parsedBody.dataVigenciaFim),
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

export namespace UpdateContratoController {
    export type Types = UpdateContratoControllerTypes;
    export type Body = UpdateContratoControllerTypes["Body"];
    export type Response = UpdateContratoControllerTypes["Response"];
}
