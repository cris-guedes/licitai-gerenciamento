import type { ProcessPdfResponse } from "@/server/shared/lib/document-handler";
import { EmbeddingProvider } from "@/server/shared/infra/providers/vector/embedding-provider";
import { FlatVectorStore } from "@/server/shared/infra/providers/vector/flat-vector-store";

type VectorEntry = {
    id:       string;
    text:     string;
    metadata: Record<string, unknown>;
};

/**
 * Responsável por chunking, embedding e indexação do documento no vector store.
 * Recebe o `ProcessPdfResponse` bruto e deixa o store pronto para busca semântica.
 */
export class EditalIndexingService {
    readonly modelName: string;
    private readonly batchSize = Number(process.env.EDITAL_INDEX_BATCH_SIZE ?? (process.env.VERCEL ? "50" : "100"));
    private readonly maxParallelBatches = Number(
        process.env.EDITAL_INDEX_CONCURRENCY ?? (process.env.VERCEL ? "2" : "0"),
    );

    constructor(
        private readonly embeddingProvider: EmbeddingProvider.Contract,
        private readonly vectorStore:       FlatVectorStore.Contract,
    ) {
        this.modelName = (embeddingProvider as any).MODEL_NAME ?? "unknown";
    }

    async index(doc: ProcessPdfResponse, sessionId: string): Promise<EditalIndexingService.IndexResult> {
        // Limpa o store antes de indexar um novo documento
        this.vectorStore.clear();

        const entries = this.buildEntries(doc, sessionId);
        if (entries.length === 0) {
            console.warn("[EditalIndexingService] Nenhuma entrada para indexar.");
            return { entriesCount: 0 };
        }

        const t0 = Date.now();

        console.log(
            `[EditalIndexingService] Preparando indexação em lotes de ${this.batchSize} (${entries.length} fragmentos, concorrência ${this.maxParallelBatches > 0 ? this.maxParallelBatches : "total"})...`,
        );
        
        // Separa em lotes independentes
        const chunkedEntries = [];
        for (let i = 0; i < entries.length; i += this.batchSize) {
            chunkedEntries.push(entries.slice(i, i + this.batchSize));
        }

        const embeddings: Float32Array[] = [];

        if (this.maxParallelBatches <= 0) {
            const batchPromises = chunkedEntries.map(batch =>
                this.embeddingProvider.embedMany(batch.map(e => e.text)),
            );
            const embeddingsGrupados = await Promise.all(batchPromises);
            embeddings.push(...embeddingsGrupados.flat() as Float32Array[]);
        } else {
            for (let i = 0; i < chunkedEntries.length; i += this.maxParallelBatches) {
                const group = chunkedEntries.slice(i, i + this.maxParallelBatches);
                const embeddingsGrupados = await Promise.all(
                    group.map(batch => this.embeddingProvider.embedMany(batch.map(e => e.text))),
                );
                embeddings.push(...embeddingsGrupados.flat() as Float32Array[]);
            }
        }

        this.vectorStore.upsert(
            entries.map((e, i) => ({
                id:        e.id,
                embedding: embeddings[i]!,
                text:      e.text,
                metadata:  e.metadata,
            })),
        );
        console.log(`[EditalIndexingService] ${entries.length} entradas indexadas em ${Date.now() - t0}ms`);
        return { entriesCount: entries.length };
    }

    private buildEntries(doc: ProcessPdfResponse, sessionId: string): VectorEntry[] {
        const entries: VectorEntry[] = [];
        let idx = 0;

        // ── Seções semânticas ──────────────────────────────────────────────────
        // Prefixar header + extrair termos relevantes via AST melhora a busca.
        for (const section of doc.sections ?? []) {
            for (const chunk of section.chunks) {
                if (!chunk.text.trim()) continue;

                const headerContext = `# ${section.header}${
                    chunk.header && chunk.header !== section.header ? `\n## ${chunk.header}` : ""
                }`;

                const meta          = chunk.metadata;
                const chunkTextLower = chunk.text.toLowerCase();

                // Termos de alta relevância do AST — evita repetição e frases longas
                const relevantTerms = [
                    ...meta.bold.fragments,
                    ...meta.italic.fragments,
                    ...meta.code.fragments,
                ]
                    .filter(term => term.length >= 3 && term.length <= 35)
                    .filter(term => !chunkTextLower.includes(term.toLowerCase()))
                    .filter((v, i, a) => a.indexOf(v) === i);

                const footer       = relevantTerms.length > 0 ? `\n\nTAGS: ${relevantTerms.join(", ")}` : "";
                const augmentedText = `${headerContext}\n\n${chunk.text}${footer}`;

                entries.push({
                    id:   `${sessionId}-chunk-${idx}`,
                    text: augmentedText,
                    metadata: {
                        type:         "text",
                        section:      section.header,
                        header:       chunk.header,
                        page:         section.page_start,
                        order:        chunk.order,
                        chunk_index:  idx++,
                        ast_metadata: chunk.metadata,
                    },
                });
            }
        }

        // ── Tabelas: markdown completo + linhas individuais ────────────────────
        let tablesMd   = 0;
        let tablesRows = 0;
        const sortedTables = [...(doc.tables ?? [])].sort(
            (a, b) => a.page - b.page || a.index - b.index,
        );

        for (const table of sortedTables) {
            // Markdown completo — visão holística (crucial para tabelas de cronograma)
            if (table.markdown?.trim()) {
                tablesMd++;
                entries.push({
                    id:   `${sessionId}-tab-${table.page}-${table.index}-md`,
                    text: `[Tabela Completa Pág ${table.page}]\n${table.markdown}`,
                    metadata: {
                        type:        "table_md",
                        page:        table.page,
                        table_index: table.index,
                        headers:     table.headers,
                        chunk_index: idx++,
                    },
                });
            }

            // Linhas individuais — granularidade para busca vetorial
            for (const row of table.chunks) {
                const rowText = table.headers
                    .map((h, i) => {
                        const v = row.data[String(i)]?.trim() ?? "";
                        return v ? `${h}: ${v}` : null;
                    })
                    .filter(Boolean)
                    .join(" | ");

                if (!rowText) continue;
                tablesRows++;
                entries.push({
                    id:   `${sessionId}-tab-${table.page}-${table.index}-${row.row_index}`,
                    text: `[Tabela Linha Pág ${table.page}] ${rowText}`,
                    metadata: {
                        type:        "table_row",
                        page:        table.page,
                        table_index: table.index,
                        row_index:   row.row_index,
                        headers:     table.headers,
                        chunk_index: idx++,
                    },
                });
            }
        }

        const textCount = idx - tablesMd - tablesRows;
        console.log(
            `[EditalIndexingService] texto: ${textCount} | tabelas_md: ${tablesMd} | tabelas_linhas: ${tablesRows} | total: ${entries.length}`,
        );
        return entries;
    }
}

export namespace EditalIndexingService {
    export type IndexResult = { entriesCount: number };
    export type Contract    = Pick<EditalIndexingService, "index" | "modelName">;
}
