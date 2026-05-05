import { Controller, HttpRequest, HttpResponse, badRequest, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { ClearDocumentChat } from "./ClearDocumentChat";
import { ClearDocumentChatControllerSchemas } from "./ClearDocumentChatControllerSchemas";

interface ClearDocumentChatControllerTypes {
    Body: null;
    Query: null;
    Params: { documentId: string };
    Response: ClearDocumentChat.Response;
}

export class ClearDocumentChatController implements Controller<ClearDocumentChatControllerTypes> {
    constructor(private readonly useCase: ClearDocumentChat) {}

    async handle(request: HttpRequest<ClearDocumentChatControllerTypes>): Promise<HttpResponse<ClearDocumentChat.Response>> {
        try {
            const user = request.user;
            if (!user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const params = ClearDocumentChatControllerSchemas.Params.parse(request.params);
            const result = await this.useCase.execute({
                documentId: params.documentId,
                userId: user.id,
            });

            return ok(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                return badRequest(new Error(error.message));
            }

            return serverError(error as Error);
        }
    }
}
