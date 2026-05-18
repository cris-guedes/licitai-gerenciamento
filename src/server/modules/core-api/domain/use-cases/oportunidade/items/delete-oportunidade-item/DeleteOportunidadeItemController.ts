import {
    badRequest,
    Controller,
    HttpRequest,
    HttpResponse,
    ok,
    serverError,
    unauthorized,
} from "@/server/modules/core-api/main/adapters/http-adapter";
import type { DeleteOportunidadeItem } from "./DeleteOportunidadeItem";
import { DeleteOportunidadeItemControllerSchemas } from "./DeleteOportunidadeItemControllerSchemas";
import { z } from "zod";

interface DeleteOportunidadeItemControllerTypes {
    Body: z.infer<typeof DeleteOportunidadeItemControllerSchemas.Body>;
    Query: null;
    Params: null;
    Response: { oportunidadeItemId: string };
}

export class DeleteOportunidadeItemController implements Controller<DeleteOportunidadeItemControllerTypes> {
    constructor(private readonly useCase: DeleteOportunidadeItem) { }

    async handle(
        request: HttpRequest<DeleteOportunidadeItemControllerTypes>,
    ): Promise<HttpResponse<DeleteOportunidadeItemControllerTypes["Response"]>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const payload = DeleteOportunidadeItemControllerSchemas.Body.parse(request.body);

            const record = await this.useCase.execute({
                companyId: payload.companyId,
                oportunidadeId: payload.oportunidadeId,
                oportunidadeItemId: payload.oportunidadeItemId,
            });

            return ok(record);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            return serverError(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
