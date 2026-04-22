import { DocumentHandlerClient, type ProcessPdfResponse, type ExtractResponse } from "@/server/shared/lib/document-handler";

const BASE_URL = process.env.DOCUMENT_HANDLER_API_URL ?? "http://localhost:8000";

export class DocumentHandlerFileParsingProvider {
    private readonly client = new DocumentHandlerClient(BASE_URL);

    /**
     * Processamento unificado (Pipeline Principal)
     * Retorna ProcessPdfResponse diretamente da lib
     */
    async process(pdfBuffer: Buffer, filename: string): Promise<ProcessPdfResponse> {
        console.log(`[DocumentHandlerFileParsingProvider] ${filename} — ${pdfBuffer.byteLength} bytes → ${BASE_URL} (Unified Process)`);
        return this.client.processPdf(pdfBuffer, filename);
    }

    /**
     * Apenas extração de texto
     * Retorna ExtractResponse diretamente da lib
     */
    async processText(pdfBuffer: Buffer, filename: string): Promise<ExtractResponse> {
        return this.client.extractText(pdfBuffer, filename);
    }

    /**
     * Apenas extração de tabelas
     * Retorna ExtractResponse diretamente da lib
     */
    async processTables(pdfBuffer: Buffer, filename: string): Promise<ExtractResponse> {
        return this.client.extractTables(pdfBuffer, filename);
    }
}

export namespace DocumentHandlerFileParsingProvider {
    /**
     * Contrato que o Worker utiliza. 
     * O Worker agora deve lidar com ProcessPdfResponse ou ExtractResponse.
     */
    export type Contract = Pick<DocumentHandlerFileParsingProvider, "process" | "processText" | "processTables">;
}
