export type SseSend = (data: object) => void;

const encoder = new TextEncoder();
const KEEP_ALIVE_INTERVAL_MS = 10_000;

function sseEvent(data: object): Uint8Array {
    return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
}

function sseComment(comment: string): Uint8Array {
    return encoder.encode(`: ${comment}\n\n`);
}

export function createSseResponse(run: (send: SseSend) => Promise<void>): Response {
    let closed = false;
    let keepAliveTimer: ReturnType<typeof setInterval> | null = null;

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            const enqueue = (chunk: Uint8Array) => {
                if (closed) return;

                try {
                    controller.enqueue(chunk);
                } catch {
                    closed = true;
                }
            };

            const send: SseSend = data => {
                enqueue(sseEvent(data));
            };

            const close = () => {
                if (keepAliveTimer) {
                    clearInterval(keepAliveTimer);
                    keepAliveTimer = null;
                }

                if (closed) return;
                closed = true;

                try {
                    controller.close();
                } catch {
                    // The client may have already aborted the response body.
                }
            };

            try {
                enqueue(sseComment("connected"));
                keepAliveTimer = setInterval(() => enqueue(sseComment("keep-alive")), KEEP_ALIVE_INTERVAL_MS);
                await run(send);
            } finally {
                close();
            }
        },
        cancel() {
            closed = true;
            if (keepAliveTimer) {
                clearInterval(keepAliveTimer);
                keepAliveTimer = null;
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}
