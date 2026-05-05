import {
    badRequest,
    created,
    Controller,
    HttpRequest,
    HttpResponse,
    notFound,
    serverError,
    unauthorized,
} from "@/server/modules/core-api/main/adapters/http-adapter";
import { z } from "zod";
import { UploadEditalDocument } from "./UploadEditalDocument";
import { UploadEditalDocumentControllerSchemas } from "./UploadEditalDocumentControllerSchemas";

interface UploadEditalDocumentControllerTypes {
    Body: UploadEditalDocumentControllerSchemas.Input;
    Query: null;
    Params: null;
    Response: UploadEditalDocument.Response;
}

export class UploadEditalDocumentController implements Controller<UploadEditalDocumentControllerTypes> {
    constructor(private readonly useCase: UploadEditalDocument) {}

    async handle(
        request: HttpRequest<UploadEditalDocumentControllerTypes>,
    ): Promise<HttpResponse<UploadEditalDocument.Response>> {
        try {
            if (!request.user) {
                return unauthorized(new Error("Usuário não autenticado."));
            }

            const body = UploadEditalDocumentControllerSchemas.Body.parse(request.body);
            const result = await this.useCase.execute({
                companyId: body.companyId,
                fileBuffer: body.fileBuffer,
                fileFilename: body.fileFilename,
                fileMimeType: body.fileMimeType,
                fileSizeBytes: body.fileSize,
                userId: request.user.id,
                createdById: request.user.id,
            });

            return created(result);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return badRequest(new Error(error.message));
            }
            if (error.message?.includes("PDF válido")) {
                return badRequest(error);
            }
            if (error.message?.includes("não encontrada")) {
                return notFound(error);
            }
            if (error.message?.includes("acesso")) {
                return unauthorized(error);
            }
            return serverError(error);
        }
    }
}
