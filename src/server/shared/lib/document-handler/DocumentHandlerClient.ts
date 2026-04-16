import type { ProcessPdfResponse } from "./generated/models/ProcessPdfResponse";

export { DocumentHandlerApiError };
export type { ProcessPdfResponse };

// ─── Erro ────────────────────────────────────────────────────────────────────

class DocumentHandlerApiError extends Error {
    constructor(
        public readonly status: number,
        public readonly body:   string,
    ) {
        super(`DocumentHandler API error ${status}: ${body}`);
        this.name = "DocumentHandlerApiError";
    }
}

// ─── Client ──────────────────────────────────────────────────────────────────

const DEFAULT_BASE_URL = process.env.DOCUMENT_HANDLER_API_URL ?? "http://localhost:8000";

/**
 * Client HTTP para o Document Handler — extração de PDF via AST.
 * POST /process-pdf → retorna seções com chunks e tabelas estruturadas.
 */
export class DocumentHandlerClient {
    private readonly base: string;

    constructor(baseUrl: string = DEFAULT_BASE_URL) {
        this.base = baseUrl.replace(/\/+$/, "");
    }

    async processPdf(file: Buffer, filename = "document.pdf"): Promise<ProcessPdfResponse> {
        const formData    = new FormData();
        const arrayBuffer = file.buffer.slice(
            file.byteOffset,
            file.byteOffset + file.byteLength,
        ) as ArrayBuffer;
        formData.append("file", new Blob([arrayBuffer], { type: "application/pdf" }), filename);

        const response = await fetch(`${this.base}/process-pdf`, {
            method: "POST",
            body:   formData,
        });

        if (!response.ok) {
            const errorBody = await response.text().catch(() => "(sem body)");
            throw new DocumentHandlerApiError(response.status, errorBody);
        }

        return response.json() as Promise<ProcessPdfResponse>;
    }
}
