import type { ChunkedDocumentResultItem } from "@/server/shared/lib/docling/models/ChunkedDocumentResultItem";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { unified } from "unified";
import remarkParse from "remark-parse";
import { toString as mdastToString } from "mdast-util-to-string";
import { toMarkdown } from "mdast-util-to-markdown";
import type { Root, Heading, RootContent } from "mdast";

// Detecta headers de seção em negrito: **1. TÍTULO** ou **1.2 Subtítulo** no início de parágrafo.
// Captura o título e deixa o restante da linha como corpo da seção.
const BOLD_SECTION_HEADER = /(?:^|\n)\*\*(\d{1,2}(?:\.\d+)*\.?\s+[A-ZÁÀÃÂÉÊÍÓÔÕÚÜÇ][^*\n]{2,120}?)\*\*(?!\*)/g;

const FALLBACK_SEPARATORS = ["\n\n", "\n", " "];

const parser = unified().use(remarkParse);

export class MarkdownChunkingProvider {
    async chunkMarkdown(params: MarkdownChunkingProvider.ChunkMarkdownParams): Promise<MarkdownChunkingProvider.ChunkMarkdownResponse> {
        const startTime    = Date.now();
        const raw          = params.mdContent ?? "";
        const chunkSize    = params.chunkSize   ?? 1500;
        const chunkOverlap = params.chunkOverlap ?? 300;

        // ── Etapa 1: normalizar headers em negrito → ## ──────────────────────
        const normalized = this.normalizeSectionHeaders(raw);

        // ── Etapa 2: parse em MDAST ──────────────────────────────────────────
        const tree = parser.parse(normalized) as Root;

        // ── Etapa 3: agrupar nós por seção (heading → body nodes) ────────────
        const sections = this.groupBySections(tree);

        // ── Etapa 4: split leve para seções grandes ──────────────────────────
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize,
            chunkOverlap,
            separators: FALLBACK_SEPARATORS,
        });

        const chunks: ChunkedDocumentResultItem[] = [];
        let chunkIndex = 0;

        for (const section of sections) {
            const headingText = section.heading
                ? mdastToString(section.heading)
                : null;

            const bodyMd = section.body
                .map(node => toMarkdown(node as Parameters<typeof toMarkdown>[0]))
                .join("\n")
                .trim();

            const fullText = headingText
                ? `${toMarkdown(section.heading as Parameters<typeof toMarkdown>[0]).trim()}\n\n${bodyMd}`.trim()
                : bodyMd;

            if (!fullText) continue;

            if (fullText.length <= chunkSize) {
                chunks.push({
                    filename:    "document.md",
                    chunk_index: chunkIndex++,
                    text:        fullText,
                    headings:    headingText ? [headingText] : null,
                    doc_items:   [],
                });
            } else {
                // Seção grande: split leve, mantém heading no primeiro sub-chunk
                const parts = await splitter.splitText(bodyMd);
                for (let i = 0; i < parts.length; i++) {
                    const subText = (i === 0 && headingText)
                        ? `${toMarkdown(section.heading as Parameters<typeof toMarkdown>[0]).trim()}\n\n${parts[i]}`.trim()
                        : parts[i].trim();

                    if (!subText) continue;

                    chunks.push({
                        filename:    "document.md",
                        chunk_index: chunkIndex++,
                        text:        subText,
                        headings:    headingText ? [headingText] : null,
                        doc_items:   [],
                    });
                }
            }
        }

        const processingTimeMs = Date.now() - startTime;

        console.log(
            `[MarkdownChunkingProvider] ${sections.length} seções → ${chunks.length} chunks` +
            ` em ${processingTimeMs}ms`
        );

        return { chunks, chunkCount: chunks.length, processingTimeMs };
    }

    // ── Normalização de headers em negrito ───────────────────────────────────

    private normalizeSectionHeaders(md: string): string {
        return md.replace(BOLD_SECTION_HEADER, (match, title) => {
            const prefix = match.startsWith("\n") ? "\n" : "";
            return `${prefix}\n## ${title.trim()}\n`;
        });
    }

    // ── Agrupamento por seção via MDAST ──────────────────────────────────────

    private groupBySections(tree: Root): Array<{ heading: Heading | null; body: RootContent[] }> {
        const sections: Array<{ heading: Heading | null; body: RootContent[] }> = [];
        let current: { heading: Heading | null; body: RootContent[] } = { heading: null, body: [] };

        for (const node of tree.children) {
            if (node.type === "heading") {
                // Flush seção atual e começa nova
                if (current.heading !== null || current.body.length > 0) {
                    sections.push(current);
                }
                current = { heading: node as Heading, body: [] };
            } else {
                current.body.push(node);
            }
        }

        // Flush última seção
        if (current.heading !== null || current.body.length > 0) {
            sections.push(current);
        }

        return sections;
    }
}

export namespace MarkdownChunkingProvider {
    export type ChunkMarkdownParams = {
        mdContent: string;
        chunkSize?: number;
        chunkOverlap?: number;
    };

    export type ChunkMarkdownResponse = {
        chunks: ChunkedDocumentResultItem[];
        chunkCount: number;
        processingTimeMs: number;
    };
}
