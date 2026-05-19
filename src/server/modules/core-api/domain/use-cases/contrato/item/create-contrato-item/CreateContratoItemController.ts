/* eslint-disable @typescript-eslint/no-explicit-any */
import { badRequest, Controller, created, HttpRequest, HttpResponse, serverError } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { CreateContratoItem } from "./CreateContratoItem";
import { CreateContratoItemControllerSchemas } from "./CreateContratoItemControllerSchemas";

interface CreateContratoItemControllerTypes {
    Body: CreateContratoItemControllerSchemas.Input;
    Query: undefined;
    Params: undefined;
    Response: CreateContratoItem.Response;
}

export class CreateContratoItemController implements Controller<CreateContratoItemControllerTypes> {
    constructor(private readonly useCase: CreateContratoItem) {}

    async handle(request: HttpRequest<CreateContratoItemControllerTypes>): Promise<HttpResponse<CreateContratoItem.Response>> {
        try {
            const parsedBody = CreateContratoItemControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute(parsedBody);

            return created(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error.statusCode === 400) return badRequest(new Error(error.message));
            if (error.statusCode === 404) return { statusCode: 404, data: { message: error.message } as any };
            return serverError(error);
        }
    }
}
