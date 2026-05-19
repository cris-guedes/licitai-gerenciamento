/* eslint-disable @typescript-eslint/no-explicit-any */
import { badRequest, Controller, HttpRequest, HttpResponse, ok, serverError } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { UpdateContratoItem } from "./UpdateContratoItem";
import { UpdateContratoItemControllerSchemas } from "./UpdateContratoItemControllerSchemas";

interface UpdateContratoItemControllerTypes {
    Body: UpdateContratoItemControllerSchemas.Input;
    Query: undefined;
    Params: undefined;
    Response: UpdateContratoItem.Response;
}

export class UpdateContratoItemController implements Controller<UpdateContratoItemControllerTypes> {
    constructor(private readonly useCase: UpdateContratoItem) {}

    async handle(request: HttpRequest<UpdateContratoItemControllerTypes>): Promise<HttpResponse<UpdateContratoItem.Response>> {
        try {
            const parsedBody = UpdateContratoItemControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute(parsedBody);

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error.statusCode === 400) return badRequest(new Error(error.message));
            if (error.statusCode === 404) return { statusCode: 404, data: { message: error.message } as any };
            return serverError(error);
        }
    }
}
