import type { IAgent } from "@/server/modules/core-api/domain/data/IAgent";
import type { DocumentHandlerFileParsingProvider } from "@/server/shared/infra/providers/pdf/document-handler-file-parsing-provider";
import type { ChunkSchema } from "@/server/shared/lib/document-handler/generated/models/ChunkSchema";
import type { LicitacaoDraftPreview } from "./draftPreview";

type DraftPreviewPayload = {
    page: number;
    content: string;
};

type DraftPreviewAgentOutput = {
    displayName: string | null;
    orgaoNome: string | null;
    modalidade: string | null;
    numero: string | null;
    objetoResumo: string | null;
    dataAbertura: string | null;
};

export class DraftPreviewExtractor {
    private readonly MAX_CHUNKS = 12;
    private readonly MAX_TOTAL_CHARS = 6000;

    constructor(
        private readonly documentParser: DocumentHandlerFileParsingProvider.Contract,
        private readonly agent: IAgent<DraftPreviewPayload[], DraftPreviewAgentOutput>,
    ) {}

    async extract(params: {
        documentId: string;
        pdfBuffer: Buffer;
        filename: string;
    }): Promise<LicitacaoDraftPreview | null> {
        const response = await this.documentParser.processText(params.pdfBuffer, params.filename);
        const firstPagePayloads = this.buildFirstPagePayloads(response.chunks);

        if (firstPagePayloads.length === 0) {
            return null;
        }

        const { data } = await this.agent.extract(firstPagePayloads);
        const preview = this.normalizePreview(data);

        if (!this.hasUsefulData(preview)) {
            return null;
        }

        return {
            source: "first_page_agent",
            sourceDocumentId: params.documentId,
            sourcePage: 1,
            extractedAt: new Date().toISOString(),
            ...preview,
        };
    }

    private buildFirstPagePayloads(chunks: ChunkSchema[]): DraftPreviewPayload[] {
        const firstPageChunks = chunks.filter(chunk => this.resolvePage(chunk) === 1);
        const sourceChunks = firstPageChunks.length > 0 ? firstPageChunks : chunks.slice(0, this.MAX_CHUNKS);

        const payloads: DraftPreviewPayload[] = [];
        let totalChars = 0;

        for (const chunk of sourceChunks) {
            const content = chunk.content.trim();
            if (!content) continue;

            const nextTotal = totalChars + content.length;
            if (payloads.length >= this.MAX_CHUNKS || nextTotal > this.MAX_TOTAL_CHARS) {
                break;
            }

            payloads.push({
                page: this.resolvePage(chunk),
                content,
            });
            totalChars = nextTotal;
        }

        return payloads;
    }

    private resolvePage(chunk: ChunkSchema): number {
        return chunk.metadata?.base?.page ?? 0;
    }

    private normalizePreview(data: DraftPreviewAgentOutput): Omit<LicitacaoDraftPreview, "source" | "sourceDocumentId" | "sourcePage" | "extractedAt"> {
        return {
            displayName: this.cleanText(data.displayName),
            orgaoNome: this.cleanText(data.orgaoNome),
            modalidade: this.cleanText(data.modalidade),
            numero: this.cleanText(data.numero),
            objetoResumo: this.cleanText(data.objetoResumo),
            dataAbertura: this.cleanText(data.dataAbertura),
        };
    }

    private hasUsefulData(preview: ReturnType<DraftPreviewExtractor["normalizePreview"]>): boolean {
        return Object.values(preview).some(value => Boolean(value));
    }

    private cleanText(value: string | null | undefined): string | null {
        if (!value) return null;

        const normalized = value.replace(/\s+/g, " ").trim();
        return normalized.length > 0 ? normalized : null;
    }
}
