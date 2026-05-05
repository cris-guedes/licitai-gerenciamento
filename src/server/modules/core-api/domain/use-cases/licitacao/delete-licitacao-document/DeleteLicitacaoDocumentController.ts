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
import { DeleteLicitacaoDocument } from "./DeleteLicitacaoDocument";
import { DeleteLicitacaoDocumentControllerSchemas } from "./DeleteLicitacaoDocumentControllerSchemas";

interface DeleteLicitacaoDocumentControllerTypes {
    Body: DeleteLicitacaoDocumentControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: DeleteLicitacaoDocument.Response;
}

export class DeleteLicitacaoDocumentController implements Controller<DeleteLicitacaoDocumentControllerTypes> {
    constructor(private readonly useCase: DeleteLicitacaoDocument) {}

    async handle(
        request: HttpRequest<DeleteLicitacaoDocumentControllerTypes>,
    ): Promise<HttpResponse<DeleteLicitacaoDocument.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const body = DeleteLicitacaoDocumentControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                companyId: body.companyId,
                documentId: body.documentId,
                userId: request.user.id,
            });

            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error instanceof Error && error.message.includes("não encontrado")) return notFound(error);
            if (error instanceof Error && error.message.includes("acesso")) return unauthorized(error);
            return serverError(error instanceof Error ? error : new Error(String(error)));
        }
    }
}
