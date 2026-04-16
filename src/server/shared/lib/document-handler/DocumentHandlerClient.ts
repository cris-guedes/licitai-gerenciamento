import { DefaultService } from "./generated/services/DefaultService";
import { OpenAPI } from "./generated/core/OpenAPI";
import type { ProcessPdfResponse } from "./generated/models/ProcessPdfResponse";

/**
 * Erro específico para a API do Document Handler
 */
export class DocumentHandlerApiError extends Error {
    constructor(
        public readonly status: number,
        public readonly body: string,
    ) {
        super(`DocumentHandler API error ${status}: ${body}`);
        this.name = "DocumentHandlerApiError";
    }
}

const DEFAULT_BASE_URL = process.env.DOCUMENT_HANDLER_API_URL ?? "http://localhost:8000";

/**
 * Client para o Document Handler — extração de PDF via AST.
 * Agora utiliza o código gerado via openapi-typescript-codegen.
 */
export class DocumentHandlerClient {
    constructor(baseUrl: string = DEFAULT_BASE_URL) {
        OpenAPI.BASE = baseUrl.replace(/\/+$/, "");
    }

    /**
     * POST /process-pdf — envia o arquivo PDF como multipart/form-data.
     * Retorna seções com chunks AST e tabelas.
     */
    async processPdf(file: Buffer, filename = "document.pdf"): Promise<ProcessPdfResponse> {
        // Conversão de Buffer para Blob compatível com o FormData do fetch/node
        const arrayBuffer = file.buffer.slice(
            file.byteOffset,
            file.byteOffset + file.byteLength,
        ) as ArrayBuffer;
        
        const blob = new Blob([arrayBuffer], { type: "application/pdf" });

        try {
            return await DefaultService.processPdfProcessPdfPost({
                formData: {
                    file: blob as any, // Cast necessário para compatibilidade de tipos gerados
                },
            });
        } catch (error: any) {
            const status = error.status ?? 0;
            const body   = error.body ? JSON.stringify(error.body) : error.message;
            throw new DocumentHandlerApiError(status, body);
        }
    }
}

export type { ProcessPdfResponse };
