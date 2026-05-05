import { Controller, HttpRequest, HttpResponse, badRequest, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { GetDocumentSummaryControllerSchemas } from "./GetDocumentSummaryControllerSchemas";
import { GetDocumentSummary } from "./GetDocumentSummary";

interface GetDocumentSummaryControllerTypes {
    Body: undefined;
    Query: null;
    Params: { documentId: string };
    Response: GetDocumentSummary.Response;
}

export class GetDocumentSummaryController implements Controller<GetDocumentSummaryControllerTypes> {
    constructor(private readonly useCase: GetDocumentSummary) {}

    async handle(request: HttpRequest<GetDocumentSummaryControllerTypes>): Promise<HttpResponse<GetDocumentSummary.Response>> {
        try {
            const user = request.user;
            if (!user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const params = GetDocumentSummaryControllerSchemas.Params.parse(request.params);
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
