import {
    Controller,
    HttpRequest,
    HttpResponse,
    badRequest,
    ok,
    serverError,
    unauthorized,
} from "@/server/modules/core-api/main/adapters/http-adapter";
import { ExtractEditalDataPostEmbeding } from "./ExtractEditalDataPostEmbeding";

interface ExtractEditalDataPostEmbedingControllerTypes {
    Body: null;
    Query: { companyId: string; documentId: string };
    Params: undefined;
    Response: ExtractEditalDataPostEmbeding.Output;
}

export class ExtractEditalDataPostEmbedingController
    implements Controller<ExtractEditalDataPostEmbedingControllerTypes>
{
    constructor(private readonly useCase: ExtractEditalDataPostEmbeding) {}

    async handle(
        request: HttpRequest<ExtractEditalDataPostEmbedingControllerTypes>,
    ): Promise<HttpResponse<ExtractEditalDataPostEmbeding.Output>> {
        try {
            const companyId = request.query?.companyId;
            const documentId = request.query?.documentId;
            const user = request.user;

            if (!companyId || typeof companyId !== "string") {
                return badRequest(new Error("companyId é obrigatório."));
            }
            if (!documentId || typeof documentId !== "string") {
                return badRequest(new Error("documentId é obrigatório."));
            }
            if (!user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const result = await this.useCase.execute({
                companyId,
                documentId,
                userId: user.id,
                createdById: user.id,
            });

            return ok(result);
        } catch (error: any) {
            console.error(error?.stack ?? error);
            return serverError(error);
        }
    }
}

export namespace ExtractEditalDataPostEmbedingController {
    export type Types = ExtractEditalDataPostEmbedingControllerTypes;
    export type Body = ExtractEditalDataPostEmbedingControllerTypes["Body"];
    export type Response = ExtractEditalDataPostEmbedingControllerTypes["Response"];
}
