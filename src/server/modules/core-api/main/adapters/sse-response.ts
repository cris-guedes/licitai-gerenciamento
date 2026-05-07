export type SseSend = (data: object) => void;

const encoder = new TextEncoder();

function sseEvent(data: object): Uint8Array {
    return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
}

export function createSseResponse(run: (send: SseSend) => Promise<void>): Response {
    let closed = false;

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            const send: SseSend = data => {
                if (closed) return;

                try {
                    controller.enqueue(sseEvent(data));
                } catch {
                    closed = true;
                }
            };

            const close = () => {
                if (closed) return;
                closed = true;

                try {
                    controller.close();
                } catch {
                    // The client may have already aborted the response body.
                }
            };

            try {
                await run(send);
            } finally {
                close();
            }
        },
        cancel() {
            closed = true;
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
        },
    });
}
