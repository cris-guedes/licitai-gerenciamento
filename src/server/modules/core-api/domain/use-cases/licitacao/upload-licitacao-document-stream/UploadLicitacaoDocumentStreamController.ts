import type { HttpRequest, StreamController } from "@/server/modules/core-api/main/adapters/http-adapter";
import { createSseResponse } from "@/server/modules/core-api/main/adapters/sse-response";
import { DocumentType } from "@prisma/client";
import { UploadLicitacaoDocument } from "./UploadLicitacaoDocument";

function serializeError(error: unknown): Record<string, unknown> {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: error.cause,
        };
    }

    return { message: String(error) };
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
        const startedAt = Date.now();
        const contentType = request.headers.get("content-type") ?? "";
        const contentLength = request.headers.get("content-length");
        const user = httpRequest.user;
        const companyId = typeof httpRequest.query?.companyId === "string" ? httpRequest.query.companyId : null;
        const oportunidadeId = typeof httpRequest.query?.oportunidadeId === "string" ? httpRequest.query.oportunidadeId : undefined;
        const editalId = typeof httpRequest.query?.editalId === "string" ? httpRequest.query.editalId : undefined;
        const replaceDocumentId = typeof httpRequest.query?.replaceDocumentId === "string" ? httpRequest.query.replaceDocumentId : undefined;
        const rawDocumentType = typeof httpRequest.query?.documentType === "string" ? httpRequest.query.documentType : null;
        const traceId = typeof httpRequest.query?.traceId === "string"
            ? httpRequest.query.traceId
            : request.headers.get("x-upload-trace-id") ?? `upload-${Date.now()}`;

        console.info(`[UploadLicitacaoDocumentStream:${traceId}] request.received`, {
            companyId,
            oportunidadeId,
            editalId,
            replaceDocumentId,
            documentType: rawDocumentType,
            contentType,
            contentLength,
            hasUser: Boolean(user),
        });

        if (!user) return errorResponse("Usuário não autenticado.", 401);
        if (!companyId) return errorResponse("companyId é obrigatório.");
        if (!rawDocumentType || !["EDITAL", "ANEXO", "OUTRO"].includes(rawDocumentType)) {
            return errorResponse("documentType é obrigatório e deve ser EDITAL, ANEXO ou OUTRO.");
        }
        if (!contentType.includes("multipart/form-data")) {
            return errorResponse("Envie o documento como multipart/form-data com o campo 'file'.");
        }

        const formReadStartedAt = Date.now();
        const formData = await request.formData().catch((error: unknown) => {
            console.error(`[UploadLicitacaoDocumentStream:${traceId}] request.formData.failed`, serializeError(error));
            return null;
        });
        if (!formData) return errorResponse("Falha ao ler o formulário de upload.");

        console.info(`[UploadLicitacaoDocumentStream:${traceId}] request.formData.ready`, {
            durationMs: Date.now() - formReadStartedAt,
            keys: Array.from(formData.keys()),
        });

        const file = formData.get("file");
        if (!(file instanceof File)) {
            console.warn(`[UploadLicitacaoDocumentStream:${traceId}] request.file.missing`, {
                keys: Array.from(formData.keys()),
            });
            return errorResponse("Campo 'file' é obrigatório.");
        }

        console.info(`[UploadLicitacaoDocumentStream:${traceId}] request.file.received`, {
            name: file.name,
            type: file.type,
            size: file.size,
        });

        const bufferReadStartedAt = Date.now();
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        console.info(`[UploadLicitacaoDocumentStream:${traceId}] request.file.buffered`, {
            bytes: fileBuffer.byteLength,
            durationMs: Date.now() - bufferReadStartedAt,
        });

        const documentType = rawDocumentType as DocumentType;
        const { useCase } = this;

        return createSseResponse(async send => {
            let lastProgress: {
                step: string;
                message: string;
                percent: number;
                status: "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
            } = {
                step: "upload.received",
                message: "Arquivo recebido, iniciando processamento do documento.",
                percent: 4,
                status: "UPLOADING",
            };
            let heartbeatCount = 0;
            const sendProgress = (event: Parameters<typeof send>[0]) => {
                if (
                    typeof event === "object"
                    && event !== null
                    && "type" in event
                    && event.type === "progress"
                    && "step" in event
                    && "message" in event
                    && "percent" in event
                    && "status" in event
                ) {
                    lastProgress = {
                        step: String(event.step),
                        message: String(event.message),
                        percent: typeof event.percent === "number" ? event.percent : lastProgress.percent,
                        status: event.status === "PROCESSING" || event.status === "READY" || event.status === "FAILED"
                            ? event.status
                            : "UPLOADING",
                    };
                }

                send(event);
            };
            const heartbeatTimer = setInterval(() => {
                heartbeatCount += 1;
                console.info(`[UploadLicitacaoDocumentStream:${traceId}] sse.heartbeat`, {
                    count: heartbeatCount,
                    lastStep: lastProgress.step,
                    elapsedMs: Date.now() - startedAt,
                });
                send({
                    type: "progress",
                    step: `${lastProgress.step}.heartbeat`,
                    message: `${lastProgress.message} Ainda processando...`,
                    percent: lastProgress.percent,
                    status: lastProgress.status,
                });
            }, 10_000);

            try {
                console.info(`[UploadLicitacaoDocumentStream:${traceId}] sse.started`, {
                    elapsedMs: Date.now() - startedAt,
                });

                sendProgress({
                    type: "progress",
                    step: "upload.received",
                    message: "Arquivo recebido, iniciando processamento do documento.",
                    percent: 4,
                    status: "UPLOADING",
                });

                const result = await useCase.execute({
                    traceId,
                    companyId,
                    oportunidadeId,
                    editalId,
                    replaceDocumentId,
                    documentType,
                    fileBuffer,
                    fileFilename: file.name,
                    fileMimeType: file.type || "application/pdf",
                    fileSizeBytes: file.size,
                    userId: user.id,
                    createdById: user.id,
                    onProgress: sendProgress,
                });

                console.info(`[UploadLicitacaoDocumentStream:${traceId}] usecase.completed`, {
                    documentId: result.documentId,
                    oportunidadeId: result.oportunidadeId,
                    editalId: result.editalId,
                    status: result.status,
                    elapsedMs: Date.now() - startedAt,
                });

                sendProgress({
                    type: "done",
                    step: "done",
                    message: "Documento processado com sucesso.",
                    percent: 100,
                    status: "READY",
                    result,
                });
            } catch (error: unknown) {
                console.error(`[UploadLicitacaoDocumentStream:${traceId}] usecase.failed`, {
                    ...serializeError(error),
                    elapsedMs: Date.now() - startedAt,
                });

                sendProgress({
                    type: "error",
                    step: "error",
                    message: error instanceof Error
                        ? error.message
                        : "Erro inesperado durante o processamento do documento.",
                    percent: 0,
                    status: "FAILED",
                });
            } finally {
                clearInterval(heartbeatTimer);
            }
        });
    }
}
