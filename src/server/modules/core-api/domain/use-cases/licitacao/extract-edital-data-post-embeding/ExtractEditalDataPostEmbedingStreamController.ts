import type { HttpRequest, StreamController } from "@/server/modules/core-api/main/adapters/http-adapter";
import { ExtractEditalDataPostEmbeding } from "./ExtractEditalDataPostEmbeding";

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

export class ExtractEditalDataPostEmbedingStreamController implements StreamController {
    constructor(private readonly useCase: ExtractEditalDataPostEmbeding) {}

    async handleStream(_request: Request, httpRequest: HttpRequest): Promise<Response> {
        const companyId = httpRequest.query?.companyId;
        const documentId = httpRequest.query?.documentId;
        const user = httpRequest.user;

        if (!user) {
            return errorResponse("Usuário não autenticado.", 401);
        }

        if (!companyId || typeof companyId !== "string") {
            return errorResponse("companyId é obrigatório.");
        }

        if (!documentId || typeof documentId !== "string") {
            return errorResponse("documentId é obrigatório.");
        }

        const { useCase } = this;

        const stream = new ReadableStream({
            async start(controller) {
                const send = (data: object) => controller.enqueue(sseEvent(data));

                try {
                    send({
                        type: "progress",
                        scope: "orchestration",
                        step: "orchestration.recover_preprocessed",
                        message: "Documento pré-processado localizado. Reutilizando índice vetorial...",
                        percent: 8,
                        pipelinePercent: 8,
                    });

                    const result = await useCase.execute({
                        companyId,
                        documentId,
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
                        message: "Extração pós-embedding concluída",
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
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    }
}
