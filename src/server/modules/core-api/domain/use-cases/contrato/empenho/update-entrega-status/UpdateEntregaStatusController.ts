import { Controller, HttpRequest, HttpResponse, ok, serverError, badRequest } from "@/server/modules/core-api/main/adapters/http-adapter";
import { UpdateEntregaStatusControllerSchemas } from "./UpdateEntregaStatusControllerSchemas";
import { UpdateEntregaStatus } from "./UpdateEntregaStatus";
import { z } from "zod";

interface UpdateEntregaStatusControllerTypes {
    Body: UpdateEntregaStatusControllerSchemas.Input;
    Query: undefined;
    Params: undefined;
    Response: UpdateEntregaStatus.Response;
}

export class UpdateEntregaStatusController implements Controller<UpdateEntregaStatusControllerTypes> {
    constructor(private readonly useCase: UpdateEntregaStatus) { }

    async handle(request: HttpRequest<UpdateEntregaStatusControllerTypes>): Promise<HttpResponse<UpdateEntregaStatus.Response>> {
        try {
            const body = UpdateEntregaStatusControllerSchemas.Body.parse(request.body);

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
