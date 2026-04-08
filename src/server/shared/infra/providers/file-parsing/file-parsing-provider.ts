import { DoclingClient } from "@/server/shared/lib/docling";

const DOCLING_BASE_URL = process.env.DOCLING_API_URL ?? "http://localhost:5001";

export class FileParsingProvider {
    private readonly client: DoclingClient;

    constructor() {
        this.client = new DoclingClient({ BASE: DOCLING_BASE_URL });
    }

    async convertUrlToMarkdown({
        pdfUrl,
    }: FileParsingProvider.ConvertUrlToMarkdownParams): Promise<FileParsingProvider.ConvertUrlToMarkdownResponse> {
        const startTime = Date.now();

        console.log(`[FileParsingProvider] Iniciando conversão — url: ${pdfUrl}`);
        console.log(`[FileParsingProvider] Docling base URL: ${DOCLING_BASE_URL}`);

        const response = await this.client.convert.processUrlV1ConvertSourcePost({
            requestBody: {
                sources: [
                    {
                        url: pdfUrl,
                        kind: "http",
                    },
                ],
                options: {
                    to_formats: ["md"],
                    do_ocr: true,
                    do_table_structure: true,
                    include_images: false,
                    abort_on_error: true,
                },
            },
        });

        const processingTimeMs = Date.now() - startTime;

        // A resposta do docling pode ser ConvertDocumentResponse ou PresignedUrlConvertDocumentResponse
        // Quando to_formats = ["md"] e sem target S3/URL, retorna ConvertDocumentResponse com document.md_content
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
    };

    export type ConvertUrlToMarkdownResponse = {
        mdContent:      string;
        filename:       string;
        processingTimeMs: number;
    };
}
