import { Controller, HttpRequest, HttpResponse, badRequest, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { GetDocumentChatControllerSchemas } from "./GetDocumentChatControllerSchemas";
import { GetDocumentChat } from "./GetDocumentChat";
import { z } from "zod";

interface GetDocumentChatControllerTypes {
    Body: null;
    Query: null;
    Params: { documentId: string };
    Response: GetDocumentChat.Response;
}

export class GetDocumentChatController implements Controller<GetDocumentChatControllerTypes> {
    constructor(private readonly useCase: GetDocumentChat) {}

    async handle(request: HttpRequest<GetDocumentChatControllerTypes>): Promise<HttpResponse<GetDocumentChat.Response>> {
        try {
            const user = request.user;
            if (!user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const params = GetDocumentChatControllerSchemas.Params.parse(request.params);
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

export namespace GetDocumentChatController {
    export type Types = GetDocumentChatControllerTypes;
}
