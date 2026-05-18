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
import { DeleteOportunidadeNote } from "./DeleteOportunidadeNote";
import { DeleteOportunidadeNoteControllerSchemas } from "./DeleteOportunidadeNoteControllerSchemas";

interface DeleteOportunidadeNoteControllerTypes {
    Body: DeleteOportunidadeNoteControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: DeleteOportunidadeNote.Response;
}

export class DeleteOportunidadeNoteController implements Controller<DeleteOportunidadeNoteControllerTypes> {
    constructor(private readonly useCase: DeleteOportunidadeNote) {}

    async handle(
        request: HttpRequest<DeleteOportunidadeNoteControllerTypes>,
    ): Promise<HttpResponse<DeleteOportunidadeNote.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const body = DeleteOportunidadeNoteControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                companyId: body.companyId,
                oportunidadeId: body.oportunidadeId,
                noteId: body.noteId,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error instanceof Error && error.message.includes("não encontrad")) return notFound(error);
            if (error instanceof Error && error.message.includes("acesso")) return unauthorized(error);
            if (error instanceof Error && error.message.includes("Somente")) return badRequest(error);
            return serverError(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
