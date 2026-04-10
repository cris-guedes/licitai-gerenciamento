import pdf2md from "@opendocsg/pdf2md";

/**
 * Provider de parsing de PDF usando @opendocsg/pdf2md (pdfjs-dist, sem serviço externo).
 * Implementa o mesmo contrato de FileParsingProvider para ser injetado no caso de uso.
 */
export class Pdf2MdFileParsingProvider {
    async convertPdfToMarkdown({
        pdfBuffer,
    }: Pdf2MdFileParsingProvider.ConvertPdfToMarkdownParams): Promise<Pdf2MdFileParsingProvider.ConvertPdfToMarkdownResponse> {
        const t0 = Date.now();

        console.log(`[Pdf2MdFileParsingProvider] Iniciando conversão — bytes: ${pdfBuffer.byteLength}`);

        // Buffer é Uint8Array — extrair um ArrayBuffer próprio para evitar "detached ArrayBuffer"
        const arrayBuffer = pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength);
        const raw = await pdf2md(arrayBuffer as ArrayBuffer);

        // 1. Remove marcadores de quebra de página gerados pelo pdf2md
        // 2. Remove cabeçalhos repetitivos de página usando o marcador único "P. M. A. Fls.___ Ass. ___"
        //    que aparece em TODA página de editais físicos — jamais no corpo do texto.
        //    O regex [^\n]* captura tudo antes do marcador na mesma linha (o endereço do órgão),
        //    deixando apenas o conteúdo real da página.
        const PAGE_HEADER = /[^\n]*P\.\s*M\.\s*A\.\s*Fls\.\s*_+\s*Ass\.\s*_+[ \t]*/g;

        const mdContent = raw
            .replace(/<!--\s*PAGE_BREAK\s*-->/gi, "\n")
            .replace(PAGE_HEADER, "")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

        const conversionTimeMs = Date.now() - t0;
        const mdFileSizeBytes  = Buffer.byteLength(mdContent, "utf8");
        const mdWordCount      = mdContent.split(/\s+/).filter(Boolean).length;

        console.log(`[Pdf2MdFileParsingProvider] Conversão concluída em ${conversionTimeMs}ms — chars: ${mdContent.length}`);

        return {
            mdContent,
            doclingFilename:  "document.md",
            conversionTimeMs,
            mdFileSizeBytes,
            mdWordCount,
        };
    }
}

export namespace Pdf2MdFileParsingProvider {
    export type ConvertPdfToMarkdownParams = {
        pdfUrl:    string;
        pdfBuffer: Buffer;
        mode?:     string;
    };

    export type ConvertPdfToMarkdownResponse = {
        mdContent:        string;
        doclingFilename:  string;
        conversionTimeMs: number;
        mdFileSizeBytes:  number;
        mdWordCount:      number;
    };
}
