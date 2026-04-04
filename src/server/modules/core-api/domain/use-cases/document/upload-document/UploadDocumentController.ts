import { badRequest, Controller, HttpRequest, HttpResponse, ok, serverError, unauthorized } from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { UploadDocument } from "./UploadDocument";
import { UploadDocumentControllerSchemas } from "./UploadDocumentControllerSchemas";

interface UploadDocumentControllerTypes {
    Body:     UploadDocumentControllerSchemas.Input;
    Query:    null;
    Params:   null;
    Response: UploadDocument.Response;
}

export class UploadDocumentController implements Controller<UploadDocumentControllerTypes> {
    constructor(private readonly useCase: UploadDocument) {}

    async handle(request: HttpRequest<UploadDocumentControllerTypes>): Promise<HttpResponse<UploadDocument.Response>> {
        try {
            if (!request.user) return unauthorized(new Error("Unauthorized"));

            const body = UploadDocumentControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({ ...body, userId: request.user.id });

            return ok(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) return badRequest(new Error(error.message));
            if (error.message?.includes("acesso")) return unauthorized(error);
            return serverError(error);
        }
    }
}
