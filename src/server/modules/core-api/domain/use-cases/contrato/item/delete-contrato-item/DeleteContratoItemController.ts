/* eslint-disable @typescript-eslint/no-explicit-any */
import { badRequest, Controller, HttpRequest, HttpResponse, ok, serverError } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { DeleteContratoItem } from "./DeleteContratoItem";
import { DeleteContratoItemControllerSchemas } from "./DeleteContratoItemControllerSchemas";

interface DeleteContratoItemControllerTypes {
    Body: DeleteContratoItemControllerSchemas.Input;
    Query: undefined;
    Params: undefined;
    Response: DeleteContratoItem.Response;
}

export class DeleteContratoItemController implements Controller<DeleteContratoItemControllerTypes> {
    constructor(private readonly useCase: DeleteContratoItem) {}

    async handle(request: HttpRequest<DeleteContratoItemControllerTypes>): Promise<HttpResponse<DeleteContratoItem.Response>> {
        try {
            const parsedBody = DeleteContratoItemControllerSchemas.Body.parse(request.body);
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
