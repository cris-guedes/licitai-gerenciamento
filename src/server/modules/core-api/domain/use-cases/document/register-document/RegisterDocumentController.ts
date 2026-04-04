import { badRequest, Controller, HttpRequest, HttpResponse, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { RegisterDocument } from "./RegisterDocument";
import { RegisterDocumentControllerSchemas } from "./RegisterDocumentControllerSchemas";

interface RegisterDocumentControllerTypes {
    Body:     RegisterDocumentControllerSchemas.Input;
    Query:    null;
    Params:   null;
    Response: RegisterDocument.Response;
}

export class RegisterDocumentController implements Controller<RegisterDocumentControllerTypes> {
    constructor(private readonly useCase: RegisterDocument) {}

    async handle(request: HttpRequest<RegisterDocumentControllerTypes>): Promise<HttpResponse<RegisterDocument.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const body = RegisterDocumentControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({ ...body, userId: request.user.id });

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error.message?.includes("acesso")) return unauthorized(error);
            return serverError(error);
        }
    }
}
