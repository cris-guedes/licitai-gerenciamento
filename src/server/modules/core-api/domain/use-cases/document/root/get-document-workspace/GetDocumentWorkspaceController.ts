import { z } from "zod";
import { Controller, HttpRequest, HttpResponse, badRequest, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { GetDocumentWorkspace } from "./GetDocumentWorkspace";
import { GetDocumentWorkspaceControllerSchemas } from "./GetDocumentWorkspaceControllerSchemas";

interface GetDocumentWorkspaceControllerTypes {
    Body: null;
    Query: null;
    Params: { documentId: string };
    Response: GetDocumentWorkspace.Response;
}

export class GetDocumentWorkspaceController implements Controller<GetDocumentWorkspaceControllerTypes> {
    constructor(private readonly useCase: GetDocumentWorkspace) {}

    async handle(request: HttpRequest<GetDocumentWorkspaceControllerTypes>): Promise<HttpResponse<GetDocumentWorkspace.Response>> {
        try {
            const user = request.user;
            if (!user) {
                return unauthorized(new Error("Usuario nao autenticado."));
            }

            const params = GetDocumentWorkspaceControllerSchemas.Params.parse(request.params);
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
