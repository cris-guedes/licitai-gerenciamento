import type { HttpRequest, StreamController } from "@/server/modules/core-api/main/adapters/http-adapter";
import { ExtractEditalData } from "./ExtractEditalData";

const encoder = new TextEncoder();

function sseEvent(data: object): Uint8Array {
    return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
}

function errorResponse(message: string, status = 400): Response {
    return new Response(
        JSON.stringify({ message }),
        { status, headers: { "Content-Type": "application/json" } },
    );
}

export class ExtractEditalDataStreamController implements StreamController {
    constructor(private readonly useCase: ExtractEditalData) {}

    async handleStream(request: Request, httpRequest: HttpRequest): Promise<Response> {
        const contentType = request.headers.get("content-type") ?? "";
        const companyId = httpRequest.query?.companyId;
        const user = httpRequest.user;

        if (!user) {
            return errorResponse("Usuário não autenticado.", 401);
        }

        if (!companyId || typeof companyId !== "string") {
            return errorResponse("companyId é obrigatório.");
        }

        if (!contentType.includes("multipart/form-data")) {
            return errorResponse("Envie o edital como multipart/form-data com o campo 'file'.");
        }

        const formData = await request.formData().catch(() => null);
        if (!formData) return errorResponse("Falha ao ler o formulário de upload.");

        const file = formData.get("file");
        if (!file || !(file instanceof File)) {
            return errorResponse("Campo 'file' é obrigatório.");
        }
        if (!file.name.toLowerCase().endsWith(".pdf")) {
            return errorResponse("Apenas arquivos PDF são suportados.");
        }

        const pdfBuffer = Buffer.from(await file.arrayBuffer());
        const { useCase } = this;

        const stream = new ReadableStream({
            async start(controller) {
                const send = (data: object) => controller.enqueue(sseEvent(data));

                try {
                    send({
                        type: "progress",
                        scope: "orchestration",
                        step: "orchestration.parse",
                        message: "Arquivo recebido, processando...",
                        percent: 8,
                        pipelinePercent: 8,
                    });

                    const result = await useCase.execute({
                        pdfBuffer,
                        pdfFilename: file.name,
                        pdfMimeType: file.type || "application/pdf",
                        pdfFileSizeBytes: file.size,
                        companyId,
                        userId: user.id,
                        createdById: user.id,
                        onProgress: send,
                        onInfoPartial: send,
                        onItemsBatchPartial: send,
                    });

                    send({
                        type: "done",
                        scope: "orchestration",
                        step: "done",
                        message: "Extração concluída",
                        percent: 100,
                        result,
                    });
                } catch (error: any) {
                    send({
                        type: "error",
                        scope: "orchestration",
                        step: "error",
                        message: error?.message ?? "Erro inesperado",
                        percent: 0,
                    });
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type":  "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection":    "keep-alive",
            },
        });
    }
}
