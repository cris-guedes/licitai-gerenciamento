import type { HttpRequest, StreamController } from "@/server/modules/core-api/main/adapters/http-adapter";
import { DocumentType } from "@prisma/client";
import { UploadLicitacaoDocument } from "./UploadLicitacaoDocument";

const encoder = new TextEncoder();

function sseEvent(data: object): Uint8Array {
    return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
}

function errorResponse(message: string, status = 400): Response {
    return new Response(JSON.stringify({ message }), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

export class UploadLicitacaoDocumentStreamController implements StreamController {
    constructor(private readonly useCase: UploadLicitacaoDocument) {}

    async handleStream(request: Request, httpRequest: HttpRequest): Promise<Response> {
        const contentType = request.headers.get("content-type") ?? "";
        const user = httpRequest.user;
        const companyId = typeof httpRequest.query?.companyId === "string" ? httpRequest.query.companyId : null;
        const licitacaoId = typeof httpRequest.query?.licitacaoId === "string" ? httpRequest.query.licitacaoId : undefined;
        const editalId = typeof httpRequest.query?.editalId === "string" ? httpRequest.query.editalId : undefined;
        const replaceDocumentId = typeof httpRequest.query?.replaceDocumentId === "string" ? httpRequest.query.replaceDocumentId : undefined;
        const rawDocumentType = typeof httpRequest.query?.documentType === "string" ? httpRequest.query.documentType : null;

        if (!user) return errorResponse("Usuário não autenticado.", 401);
        if (!companyId) return errorResponse("companyId é obrigatório.");
        if (!rawDocumentType || !["EDITAL", "ANEXO", "OUTRO"].includes(rawDocumentType)) {
            return errorResponse("documentType é obrigatório e deve ser EDITAL, ANEXO ou OUTRO.");
        }
        if (!contentType.includes("multipart/form-data")) {
            return errorResponse("Envie o documento como multipart/form-data com o campo 'file'.");
        }

        const formData = await request.formData().catch(() => null);
        if (!formData) return errorResponse("Falha ao ler o formulário de upload.");

        const file = formData.get("file");
        if (!(file instanceof File)) {
            return errorResponse("Campo 'file' é obrigatório.");
        }

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const documentType = rawDocumentType as DocumentType;
        const { useCase } = this;

        const stream = new ReadableStream({
            async start(controller) {
                const send = (data: object) => controller.enqueue(sseEvent(data));

                try {
                    send({
                        type: "progress",
                        step: "upload.received",
                        message: "Arquivo recebido, iniciando processamento do documento.",
                        percent: 4,
                        status: "UPLOADING",
                    });

                    const result = await useCase.execute({
                        companyId,
                        licitacaoId,
                        editalId,
                        replaceDocumentId,
                        documentType,
                        fileBuffer,
                        fileFilename: file.name,
                        fileMimeType: file.type || "application/pdf",
                        fileSizeBytes: file.size,
                        userId: user.id,
                        createdById: user.id,
                        onProgress: send,
                    });

                    send({
                        type: "done",
                        step: "done",
                        message: "Documento processado com sucesso.",
                        percent: 100,
                        status: "READY",
                        result,
                    });
                } catch (error: unknown) {
                    send({
                        type: "error",
                        step: "error",
                        message: error instanceof Error
                            ? error.message
                            : "Erro inesperado durante o processamento do documento.",
                        percent: 0,
                        status: "FAILED",
                    });
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    }
}
