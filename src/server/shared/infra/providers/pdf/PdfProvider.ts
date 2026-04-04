export interface PdfProvider {
    extractText(buffer: Buffer): Promise<string>;
    extractTextFromUrl(url: string): Promise<string>;
}
