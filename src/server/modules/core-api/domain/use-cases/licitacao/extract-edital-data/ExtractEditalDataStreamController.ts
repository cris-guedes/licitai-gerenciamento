import type { StreamController } from "@/server/modules/core-api/main/adapters/http-adapter";
import { ExtractEditalData } from "./ExtractEditalData";

const encoder = new TextEncoder();

function sseEvent(data: object): Uint8Array {
    return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
}

function errorResponse(message: string): Response {
    return new Response(
        JSON.stringify({ message }),
        { status: 400, headers: { "Content-Type": "application/json" } },
    );
}

export class ExtractEditalDataStreamController implements StreamController {
    constructor(private readonly useCase: ExtractEditalData) {}

    async handleStream(request: Request): Promise<Response> {
        const contentType = request.headers.get("content-type") ?? "";

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
                    send({ step: "parse", message: "Arquivo recebido, processando...", percent: 8 });

                    const result = await useCase.execute({
                        pdfBuffer,
                        onProgress: send,
                    });

                    send({ step: "done", message: "Extração concluída", percent: 100, result });
                } catch (error: any) {
                    send({ step: "error", message: error?.message ?? "Erro inesperado", percent: 0 });
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
