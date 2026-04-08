import { DoclingClient } from "@/server/shared/lib/docling";
import { EXTRACTION_MODE_OPTIONS, type ExtractionMode } from "./extraction-modes";

const DOCLING_BASE_URL = process.env.DOCLING_API_URL ?? "http://localhost:5001";

export class FileParsingProvider {
    private readonly client: DoclingClient;

    constructor() {
        this.client = new DoclingClient({ BASE: DOCLING_BASE_URL });
    }

    async convertUrlToMarkdown({
        pdfUrl,
        mode = "balanceado",
    }: FileParsingProvider.ConvertUrlToMarkdownParams): Promise<FileParsingProvider.ConvertUrlToMarkdownResponse> {
        const startTime = Date.now();
        const options   = EXTRACTION_MODE_OPTIONS[mode];

        console.log(`[FileParsingProvider] Iniciando conversão — url: ${pdfUrl} — modo: ${mode}`);
        console.log(`[FileParsingProvider] Docling base URL: ${DOCLING_BASE_URL}`);

        const response = await this.client.convert.processUrlV1ConvertSourcePost({
            requestBody: {
                sources: [{ url: pdfUrl, kind: "http" }],
                options: {
                    to_formats: ["md"],
                    ...options,
                },
            },
        });

        const processingTimeMs = Date.now() - startTime;

        const doc = (response as any).document as {
            filename: string;
            md_content?: string | null;
        };

        const mdContent = doc?.md_content ?? "";
        const filename  = doc?.filename ?? "document.md";

        console.log(`[FileParsingProvider] Conversão concluída em ${processingTimeMs}ms — filename: ${filename} — chars: ${mdContent.length}`);

        return { mdContent, filename, processingTimeMs };
    }
}

export namespace FileParsingProvider {
    export type ConvertUrlToMarkdownParams = {
        pdfUrl: string;
        mode?:  ExtractionMode;
    };

    export type ConvertUrlToMarkdownResponse = {
        mdContent:        string;
        filename:         string;
        processingTimeMs: number;
    };
}
