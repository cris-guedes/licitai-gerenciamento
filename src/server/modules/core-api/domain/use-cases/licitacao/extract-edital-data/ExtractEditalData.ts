import crypto from "crypto";
import { EditalExtractionProvider } from "@/server/shared/infra/providers/ai/edital-extraction/edital-extraction-provider";
import { DocumentHandlerFileParsingProvider } from "@/server/shared/infra/providers/file-parsing/document-handler-file-parsing-provider";
import { EmbeddingProvider } from "@/server/shared/infra/providers/embeddings/embedding-provider";
import { FlatVectorStore } from "@/server/shared/infra/providers/embeddings/flat-vector-store";
import { MetricsProvider } from "@/server/shared/infra/providers/metrics/metrics-provider";
import { ExtractionSessionProvider } from "@/server/shared/infra/providers/session/extraction-session-provider";
import { HttpDownloadProvider } from "@/server/shared/infra/providers/download/download-provider";
import { ExtractEditalDataControllerSchemas } from "./ExtractEditalDataControllerSchemas";
import { VectorSearchAgent } from "@/server/shared/infra/providers/ai/edital-extraction/vector-search-agent";
import type { ProcessPdfResponse } from "@/server/shared/lib/document-handler";

export class ExtractEditalData {
    private readonly agent: VectorSearchAgent;

    constructor(
        private readonly documentParser: DocumentHandlerFileParsingProvider.Contract,
        private readonly embeddingProvider: EmbeddingProvider.Contract,
        private readonly vectorStore: FlatVectorStore.Contract,
        private readonly aiExtractor: EditalExtractionProvider,
        private readonly metricsProvider: MetricsProvider.Contract,
        private readonly sessionStorage: ExtractionSessionProvider,
        private readonly downloadProvider: HttpDownloadProvider.Contract,
    ) {
        this.agent = new VectorSearchAgent(this.embeddingProvider, this.vectorStore);
    }

    async execute(request: ExtractEditalData.Params): Promise<ExtractEditalData.Response> {
        this.vectorStore.clear();
        let { pdfUrl, pdfBuffer, sessionId: existingSessionId } = request;
        const sessionId = existingSessionId ?? crypto.randomUUID();
        const totalTimer = this.metricsProvider.startTimer("extract_total");

        console.log(`[ExtractEditalData] Iniciando extração para sessão: ${sessionId}`);

        // 1. Download
        if (!pdfBuffer && pdfUrl) {
            const dl = await this.downloadProvider.download(pdfUrl);
            pdfBuffer = dl.buffer;
        }
        if (!pdfBuffer) throw new Error("É necessário fornecer pdfBuffer ou pdfUrl");

        // 2. Parse via DocumentHandler
        const tConvert = this.metricsProvider.startTimer("convert_pdf");
        const { response, wallTimeMs: apiTimeMs } = await this.documentParser.process(pdfBuffer, pdfUrl);
        const conversionTimeMs = tConvert({ sessionId, apiMs: apiTimeMs });

        // 3. Embedding & Indexing
        const vectorEntries = this.buildVectorEntries(response, sessionId);
        if (vectorEntries.length > 0) {
            const tEmbed = Date.now();
            const emb = await this.embeddingProvider.embedMany(vectorEntries.map(e => e.text));
            this.vectorStore.upsert(vectorEntries.map((e, i) => ({
                id: e.id, embedding: emb[i] as Float32Array, text: e.text, metadata: e.metadata,
            })));
            console.log(`[ExtractEditalData] Embedding/Indexing concluído em ${Date.now() - tEmbed}ms`);
        }

        // 4. Extração via agente
        console.log(`[ExtractEditalData] Iniciando extração via agente...`);
        const tExtract = Date.now();

        await this.agent.warmupEmbeddings();
        const agentResult = await this.agent.extract();

        console.log(`[ExtractEditalData] Extração IA concluída em ${Date.now() - tExtract}ms`);

        const extraction = this.mapAgentResultToSchema(agentResult.extraction);
        if (extraction?.edital) extraction.edital.itens = [];

        // 5. Métricas e Resposta
        const metrics: ExtractEditalDataControllerSchemas.Metrics = {
            sessionId,
            timestamp: new Date().toISOString(),
            pdfUrl: pdfUrl || "buffer-upload",
            pdfFileSizeBytes: response.file_size_bytes,
            conversionTimeMs,
            chunkingTimeMs: 0,
            scoringTimeMs: 0,
            filteredChunkCount: vectorEntries.length,
            extractionTimeMs: Date.now() - tExtract,
            totalTimeMs: totalTimer({ sessionId }),
            mdFileSizeBytes: response.total_chars,
            mdWordCount: response.total_words,
            chunkCount: vectorEntries.length,
            totalTablesInPdf: response.total_tables,
            doclingFilename: response.filename,
            tempDir: this.sessionStorage.tempDirFor(sessionId),
            tokensUsed: agentResult.tokensUsed,
            config: {
                chunkSize: 0, chunkOverlap: 0,
                embeddingModel: this.embeddingProvider.MODEL_NAME,
                aiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
                fileParser: this.documentParser.constructor.name,
                extractionMode: "Turbo-VectorAgent",
                topKPorIntent: {},
                queriesPorIntent: { "agent_searches": agentResult.searchesPerformed as any },
            },
            topChunks: [],
        };

        const mdContent = response.pages.flatMap(p => p.chunks.map(c => c.text)).join("\n\n---\n\n");
        const finalExtraction = extraction as ExtractEditalData.Response["extraction"];
        await this.sessionStorage.save({ sessionId, pdfBuffer, mdContent, filteredMd: mdContent, chunks: [], topChunks: [], extraction: finalExtraction, metrics });
        return { sessionId, mdContent, extraction: finalExtraction, metrics };
    }

    private mapAgentResultToSchema(raw: any): any {
        const e = raw?.edital ?? {};
        const cron = e.cronograma ?? {};
        const datas = {
            data_abertura: cron.data_abertura_propostas ?? null,
            data_proposta_limite: cron.data_limite_propostas ?? null,
            hora_proposta_limite: cron.hora_limite_propostas ?? null,
            data_esclarecimento_impugnacao: cron.data_limite_esclarecimentos ?? null,
            cadastro_inicio: null,
            cadastro_fim: null,
        };

        return {
            edital: {
                ...e,
                numero: e.numero ?? "Não encontrado",
                numero_processo: e.numero_processo ?? "Não encontrado",
                modalidade: e.modalidade ?? "Outras",
                objeto_resumido: e.objeto_resumido ?? e.objeto ?? "Não detalhado",
                identificacao: {
                    uasg: e.orgao_gerenciador?.uasg ?? "N/A",
                    portal: e.orgao_gerenciador?.portal ?? "N/A",
                },
                classificacao: {
                    ambito: e.orgao_gerenciador?.esfera ?? "Não identificado",
                },
                datas,
                itens: [],
            }
        };
    }

    private buildVectorEntries(doc: ProcessPdfResponse, sessionId: string): ExtractEditalData.VectorEntry[] {
        const entries: ExtractEditalData.VectorEntry[] = [];
        let idx = 0;

        // Chunks de texto
        for (const page of doc.pages) {
            for (const chunk of page.chunks) {
                if (!chunk.text.trim()) continue;
                entries.push({
                    id: `${sessionId}-txt-${page.page}-${chunk.order}`,
                    text: chunk.text,
                    metadata: { type: "text", page: page.page, order: chunk.order, chunk_index: idx++ },
                });
            }
        }

        // Tabelas: inclui TANTO markdown completo QUANTO linhas individuais
        let tablesMd = 0, tablesRows = 0;
        for (const table of [...doc.tables].sort((a, b) => a.page - b.page || a.index - b.index)) {
            // Markdown completo — visão holística (crucial para tabelas de cronograma)
            if (table.markdown?.trim()) {
                tablesMd++;
                entries.push({
                    id: `${sessionId}-tab-${table.page}-${table.index}-md`,
                    text: `[Tabela Completa Pág ${table.page}]\n${table.markdown}`,
                    metadata: { type: "table_md", page: table.page, table_index: table.index, headers: table.headers, chunk_index: idx++ },
                });
            }

            // Linhas individuais — granularidade para busca vetorial
            for (const row of table.chunks) {
                const text = table.headers
                    .map((h, i) => { const v = row.data[String(i)]?.trim() ?? ""; return v ? `${h}: ${v}` : null; })
                    .filter(Boolean).join(" | ");
                if (!text) continue;
                tablesRows++;
                entries.push({
                    id: `${sessionId}-tab-${table.page}-${table.index}-${row.row_index}`,
                    text: `[Tabela Linha Pág ${table.page}] ${text}`,
                    metadata: { type: "table_row", page: table.page, table_index: table.index, row_index: row.row_index, headers: table.headers, chunk_index: idx++ },
                });
            }
        }

        console.log(`[buildVectorEntries] texto: ${idx - tablesMd - tablesRows} | tabelas_md: ${tablesMd} | tabelas_linhas: ${tablesRows} | total: ${entries.length}`);
        return entries;
    }

}

export namespace ExtractEditalData {
    export interface Params extends Partial<ExtractEditalDataControllerSchemas.Input> {
        pdfUrl: string;
        pdfBuffer?: Buffer;
        sessionId?: string;
    }
    export type Response = ExtractEditalDataControllerSchemas.Output;
    export type VectorEntry = {
        id: string;
        text: string;
        metadata: Record<string, unknown>;
    };
}
