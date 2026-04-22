import type { ProcessPdfResponse } from "./generated/models/ProcessPdfResponse";
import type { ExtractResponse }    from "./generated/models/ExtractResponse";

export { DocumentHandlerApiError };
export type { ProcessPdfResponse, ExtractResponse };

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
 * POST /process-pdf      → seções com chunks e tabelas estruturadas (pipeline principal).
 * POST /extract-tables   → tabelas em markdown + chunks simples.
 * POST /extract-text     → texto corrido + chunks simples.
 */
export class DocumentHandlerClient {
    private readonly base: string;

    constructor(baseUrl: string = DEFAULT_BASE_URL) {
        this.base = baseUrl.replace(/\/+$/, "");
    }

    async processPdf(file: Buffer, filename = "document.pdf"): Promise<ProcessPdfResponse> {
        return this.postPdf("/process-pdf", file, filename);
    }

    async extractTables(file: Buffer, filename = "document.pdf"): Promise<ExtractResponse> {
        return this.postPdf("/extract-tables", file, filename);
    }

    async extractText(file: Buffer, filename = "document.pdf"): Promise<ExtractResponse> {
        return this.postPdf("/extract-text", file, filename);
    }

    private async postPdf<T>(path: string, file: Buffer, filename: string): Promise<T> {
        const formData    = new FormData();
        const arrayBuffer = file.buffer.slice(
            file.byteOffset,
            file.byteOffset + file.byteLength,
        ) as ArrayBuffer;
        formData.append("file", new Blob([arrayBuffer], { type: "application/pdf" }), filename);

        const url = `${this.base}${path}`;
        console.log(`[DocumentHandlerClient] POST ${url} — ${file.byteLength} bytes, filename: ${filename}`);

        let response: Response;
        try {
            response = await fetch(url, { method: "POST", body: formData });
        } catch (err: any) {
            console.error(`[DocumentHandlerClient] Fetch falhou para ${url}:`, err.message, err.cause ?? "");
            throw err;
        }

        if (!response.ok) {
            const errorBody = await response.text().catch(() => "(sem body)");
            throw new DocumentHandlerApiError(response.status, errorBody);
        }

        return response.json() as Promise<T>;
    }
}
