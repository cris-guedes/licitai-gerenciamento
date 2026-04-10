import { DoclingClient } from "@/server/shared/lib/docling";
import { EXTRACTION_MODE_OPTIONS, type ExtractionMode } from "./extraction-modes";

const DOCLING_BASE_URL         = process.env.DOCLING_API_URL ?? "http://localhost:5001";
const DOCLING_PARALLEL_WORKERS = parseInt(process.env.DOCLING_PARALLEL_WORKERS ?? "2", 10);

export class FileParsingProvider {
    private readonly client: DoclingClient;

    constructor() {
        this.client = new DoclingClient({ BASE: DOCLING_BASE_URL });
    }

    async convertUrlToMarkdown({
        pdfUrl,
        mode = "balanceado",
        pageRange,
    }: FileParsingProvider.ConvertUrlToMarkdownParams): Promise<FileParsingProvider.ConvertUrlToMarkdownResponse> {
        const startTime = Date.now();
        const options   = EXTRACTION_MODE_OPTIONS[mode];
        const rangeTag  = pageRange ? ` [pgs ${pageRange[0]}-${pageRange[1]}]` : "";

        console.log(`[FileParsingProvider] Iniciando conversão — url: ${pdfUrl} — modo: ${mode}${rangeTag}`);
        console.log(`[FileParsingProvider] Docling base URL: ${DOCLING_BASE_URL}`);

        const response = await this.client.convert.processUrlV1ConvertSourcePost({
            requestBody: {
                sources: [{ url: pdfUrl, kind: "http" }],
                options: {
                    to_formats: ["md"],
                    ...options,
                    ...(pageRange ? { page_range: pageRange } : {}),
                },
            },
        });

        const processingTimeMs = Date.now() - startTime;

        const doc = (response as any).document as {
            filename: string;
            md_content?: string | null;
        };

        let mdContent = doc?.md_content ?? "";
        const filename  = doc?.filename ?? "document.md";

        if (mdContent.length === 0) {
            console.warn(`[FileParsingProvider] AVISO: Docling retornou Markdown vazio. Tentando fallback para text_content...`);
            const fallbackText = (doc as any)?.text_content;

            if (fallbackText && fallbackText.length > 0) {
                console.log(`[FileParsingProvider] Fallback OK: Usando text_content (${fallbackText.length} chars)`);
                // Envolve o texto puro em um formato que não quebre o processamento posterior
                mdContent = fallbackText;
            } else {
                console.warn(`[FileParsingProvider] ERRO: text_content também está vazio.`);
                console.log(`[FileParsingProvider] Keys da resposta: ${Object.keys(response ?? {}).join(", ")}`);
                if (response && "document" in response) {
                    console.log(`[FileParsingProvider] Keys de 'document': ${Object.keys((response as any).document ?? {}).join(", ")}`);
                }
            }
        }

        console.log(`[FileParsingProvider] Conversão concluída em ${processingTimeMs}ms — filename: ${filename} — chars: ${mdContent.length}${rangeTag}`);

        return { mdContent, filename, processingTimeMs };
    }

    async convertPdfToMarkdown({
        pdfUrl,
        pdfBuffer,
        mode = "balanceado",
    }: FileParsingProvider.ConvertPdfToMarkdownParams): Promise<FileParsingProvider.ConvertPdfToMarkdownResponse> {
        const totalPages = FileParsingProvider.countPdfPages(pdfBuffer);
        const chunkSize  = Math.ceil(totalPages / DOCLING_PARALLEL_WORKERS);
        const pageRanges = Array.from(
            { length: DOCLING_PARALLEL_WORKERS },
            (_, i): [number, number] => [i * chunkSize + 1, Math.min((i + 1) * chunkSize, totalPages)],
        ).filter(([s, e]) => s <= e);

        const t0      = Date.now();
        const results = await Promise.all(
            pageRanges.map(pageRange =>
                this.convertUrlToMarkdown({
                    pdfUrl, mode,
                    pageRange: totalPages > 1 ? pageRange : undefined,
                }),
            ),
        );

        const mdContent       = results.map(r => r.mdContent).join("\n\n---\n\n");
        const mdFileSizeBytes = Buffer.byteLength(mdContent, "utf8");
        const mdWordCount     = mdContent.split(/\s+/).filter(Boolean).length;

        return {
            mdContent,
            doclingFilename:  results[0]?.filename ?? "document.md",
            conversionTimeMs: Date.now() - t0,
            mdFileSizeBytes,
            mdWordCount,
        };
    }

    static countPdfPages(buffer: Buffer): number {
        const matches = buffer.toString("latin1").match(/\/Type\s*\/Page(?!s)/g);
        return matches?.length ?? 1;
    }
}

export namespace FileParsingProvider {
    /** Interface estrutural — qualquer provider que implemente convertPdfToMarkdown é compatível */
    export type Contract = {
        convertPdfToMarkdown(params: ConvertPdfToMarkdownParams): ConvertPdfToMarkdownResponse | Promise<ConvertPdfToMarkdownResponse>;
    };

    export type ConvertUrlToMarkdownParams = {
        pdfUrl:     string;
        mode?:      ExtractionMode;
        pageRange?: [number, number];
    };

    export type ConvertUrlToMarkdownResponse = {
        mdContent:        string;
        filename:         string;
        processingTimeMs: number;
    };

    export type ConvertPdfToMarkdownParams = {
        pdfUrl:    string;
        pdfBuffer: Buffer;
        mode?:     ExtractionMode;
    };

    export type ConvertPdfToMarkdownResponse = {
        mdContent:        string;
        doclingFilename:  string;
        conversionTimeMs: number;
        mdFileSizeBytes:  number;
        mdWordCount:      number;
    };
}
