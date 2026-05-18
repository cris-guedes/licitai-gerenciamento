import {
    badRequest,
    Controller,
    HttpRequest,
    HttpResponse,
    ok,
    serverError,
    unauthorized,
} from "@/server/modules/core-api/main/adapters/http-adapter";
import type { CreateOportunidadeItem } from "./CreateOportunidadeItem";
import { CreateOportunidadeItemControllerSchemas } from "./CreateOportunidadeItemControllerSchemas";
import { z } from "zod";

interface CreateOportunidadeItemControllerTypes {
    Body: z.infer<typeof CreateOportunidadeItemControllerSchemas.Body>;
    Query: null;
    Params: null;
    Response: { item: any };
}

export class CreateOportunidadeItemController implements Controller<CreateOportunidadeItemControllerTypes> {
    constructor(private readonly useCase: CreateOportunidadeItem) { }

    async handle(
        request: HttpRequest<CreateOportunidadeItemControllerTypes>,
    ): Promise<HttpResponse<CreateOportunidadeItemControllerTypes["Response"]>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const payload = CreateOportunidadeItemControllerSchemas.Body.parse(request.body);

            const record = await this.useCase.execute({
                companyId: payload.companyId,
                oportunidadeId: payload.oportunidadeId,
                data: payload.data,
            });

            return ok({ item: record });
        } catch (error: unknown) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            return serverError(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
