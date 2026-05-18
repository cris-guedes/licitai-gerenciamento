import {
    badRequest,
    Controller,
    HttpRequest,
    HttpResponse,
    notFound,
    ok,
    serverError,
    unauthorized,
} from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { CreateOportunidadeNote } from "./CreateOportunidadeNote";
import { CreateOportunidadeNoteControllerSchemas } from "./CreateOportunidadeNoteControllerSchemas";

interface CreateOportunidadeNoteControllerTypes {
    Body: CreateOportunidadeNoteControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: CreateOportunidadeNote.Response;
}

export class CreateOportunidadeNoteController implements Controller<CreateOportunidadeNoteControllerTypes> {
    constructor(private readonly useCase: CreateOportunidadeNote) {}

    async handle(
        request: HttpRequest<CreateOportunidadeNoteControllerTypes>,
    ): Promise<HttpResponse<CreateOportunidadeNote.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const body = CreateOportunidadeNoteControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                companyId: body.companyId,
                oportunidadeId: body.oportunidadeId,
                content: body.content,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error instanceof Error && error.message.includes("não encontrad")) return notFound(error);
            if (error instanceof Error && error.message.includes("acesso")) return unauthorized(error);
            if (error instanceof Error && (error.message.includes("Somente") || error.message.includes("conteúdo"))) return badRequest(error);
            return serverError(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
