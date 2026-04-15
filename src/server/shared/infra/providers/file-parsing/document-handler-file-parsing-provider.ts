import { DocumentHandlerClient, type ProcessPdfResponse } from "@/server/shared/lib/document-handler";

const BASE_URL = process.env.DOCUMENT_HANDLER_API_URL ?? "http://localhost:8000";

export class DocumentHandlerFileParsingProvider {
    private readonly client = new DocumentHandlerClient(BASE_URL);

    async process(pdfBuffer: Buffer, pdfUrl?: string): Promise<DocumentHandlerFileParsingProvider.Result> {
        const filename = pdfUrl
            ? (pdfUrl.split("/").pop()?.split("?")[0] ?? "document.pdf")
            : "document.pdf";

        console.log(`[DocumentHandlerFileParsingProvider] ${filename} — ${pdfBuffer.byteLength} bytes → ${BASE_URL}`);
        const t0       = Date.now();
        const response = await this.client.processPdf(pdfBuffer, filename);
        const wallTimeMs = Date.now() - t0;

        console.log(`[DocumentHandlerFileParsingProvider] páginas: ${response.total_pages} | tabelas: ${response.total_tables} | chars: ${response.total_chars} | ${wallTimeMs}ms`);
        return { response, wallTimeMs };
    }
}

export namespace DocumentHandlerFileParsingProvider {
    export type Result = {
        response:    ProcessPdfResponse;
        wallTimeMs:  number;
    };
    export type Contract = Pick<DocumentHandlerFileParsingProvider, "process">;
}
