import { Controller, HttpRequest, HttpResponse, badRequest, created, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { AskDocumentChat } from "./AskDocumentChat";
import { AskDocumentChatControllerSchemas } from "./AskDocumentChatControllerSchemas";

interface AskDocumentChatControllerTypes {
    Body: { message: string };
    Query: null;
    Params: { documentId: string };
    Response: AskDocumentChat.Response;
}

export class AskDocumentChatController implements Controller<AskDocumentChatControllerTypes> {
    constructor(private readonly useCase: AskDocumentChat) {}

    async handle(request: HttpRequest<AskDocumentChatControllerTypes>): Promise<HttpResponse<AskDocumentChat.Response>> {
        try {
            const user = request.user;
            if (!user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const params = AskDocumentChatControllerSchemas.Params.parse(request.params);
            const body = AskDocumentChatControllerSchemas.Body.parse(request.body);

            const result = await this.useCase.execute({
                documentId: params.documentId,
                userId: user.id,
                message: body.message,
            });

            return created(result);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                return badRequest(new Error(error.message));
            }

            return serverError(error as Error);
        }
    }
}
