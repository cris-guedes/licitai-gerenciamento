import type { PdfProvider } from "./PdfProvider";

export class PdfParseProvider implements PdfProvider {
    async extractText(buffer: Buffer): Promise<string> {
        // Lazy require to avoid pdf-parse reading test files at module load time (breaks Next.js)
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>;
        const result = await pdfParse(buffer);
        return result.text;
    }

    async extractTextFromUrl(url: string): Promise<string> {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch document: ${url} (${response.status})`);
        const buffer = Buffer.from(await response.arrayBuffer());
        return this.extractText(buffer);
    }
}
