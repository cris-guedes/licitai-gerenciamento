import { Controller, HttpRequest, HttpResponse, badRequest, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { SummarizeDocument } from "./SummarizeDocument";
import { SummarizeDocumentControllerSchemas } from "./SummarizeDocumentControllerSchemas";

interface SummarizeDocumentControllerTypes {
    Body: undefined;
    Query: null;
    Params: { documentId: string };
    Response: SummarizeDocument.Response;
}

export class SummarizeDocumentController implements Controller<SummarizeDocumentControllerTypes> {
    constructor(private readonly useCase: SummarizeDocument) {}

    async handle(request: HttpRequest<SummarizeDocumentControllerTypes>): Promise<HttpResponse<SummarizeDocument.Response>> {
        try {
            const user = request.user;
            if (!user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const params = SummarizeDocumentControllerSchemas.Params.parse(request.params);

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
