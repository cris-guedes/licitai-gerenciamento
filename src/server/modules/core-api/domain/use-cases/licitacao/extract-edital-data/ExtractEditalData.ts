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
import { TableItemExtractorAgent } from "@/server/shared/infra/providers/ai/edital-extraction/table-item-extractor";
import type { ProcessPdfResponse } from "@/server/shared/lib/document-handler";

export class ExtractEditalData {
    private readonly agent: VectorSearchAgent;
    private readonly itemsAgent: TableItemExtractorAgent;

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
        this.itemsAgent = new TableItemExtractorAgent(this.embeddingProvider, this.vectorStore);
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

        // DEBUG: Inspecionar seções do DocumentHandler
        console.log(`[ExtractEditalData] 📋 Seções retornadas pelo DocumentHandler (${response.sections.length}):`);
        for (const [i, section] of response.sections.entries()) {
            const firstChunkPreview = section.chunks[0]?.text?.slice(0, 120) ?? "(sem chunks)";
            console.log(`  [${i}] header="${section.header}" | level=${section.level} | page=${section.page_start} | chunks=${section.chunks.length} | preview: ${firstChunkPreview}`);
        }

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

        // 4. Extração via agentes paralelos
        console.log(`[ExtractEditalData] Iniciando extração via agentes (Principal + Tabelas ITENS)...`);
        const tExtract = Date.now();

        await Promise.all([this.agent.warmupEmbeddings(), this.itemsAgent.warmupEmbeddings()]);
        
        const [agentResult, itemsResult] = await Promise.all([
            this.agent.extract(),
            this.itemsAgent.extract()
        ]);

        console.log(`[ExtractEditalData] Extração IA concluída em ${Date.now() - tExtract}ms`);

        const extraction = this.mapAgentResultToSchema(agentResult.extraction);
        if (extraction?.edital && itemsResult.itens) {
            extraction.edital.itens = itemsResult.itens;
        }

        // 5. Métricas e Resposta
        const topChunks = agentResult.hits.slice(0, 20).map(hit => ({
            id: hit.id,
            score: hit.score,
            headings: [hit.metadata.section as string, hit.metadata.header as string].filter(Boolean),
            charCount: hit.text?.length ?? 0,
            preview: hit.text?.slice(0, 500) ?? ""
        }));

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
            tokensUsed: {
                prompt: agentResult.tokensUsed.prompt + itemsResult.tokensUsed.prompt,
                completion: agentResult.tokensUsed.completion + itemsResult.tokensUsed.completion,
                total: agentResult.tokensUsed.total + itemsResult.tokensUsed.total
            },
            config: {
                chunkSize: 0, chunkOverlap: 0,
                embeddingModel: this.embeddingProvider.MODEL_NAME,
                aiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
                fileParser: this.documentParser.constructor.name,
                extractionMode: "Turbo-VectorAgent",
                topKPorIntent: {},
                queriesPorIntent: { "agent_searches": agentResult.searchesPerformed as any },
            },
            topChunks,
        };

        const mdContent = response.sections.flatMap(s => s.chunks.map(c => c.text)).join("\n\n---\n\n");
        const finalExtraction = extraction as ExtractEditalData.Response["extraction"];
        await this.sessionStorage.save({ sessionId, pdfBuffer, mdContent, filteredMd: mdContent, chunks: [], topChunks, extraction: finalExtraction, metrics });
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
                itens: e.itens ?? [],
            }
        };
    }

    private buildVectorEntries(doc: ProcessPdfResponse, sessionId: string): ExtractEditalData.VectorEntry[] {
        const entries: ExtractEditalData.VectorEntry[] = [];
        let idx = 0;

        // Chunks de texto (Seções)
        for (const section of doc.sections) {
            for (const chunk of section.chunks) {
                if (!chunk.text.trim()) continue;

                // Enriquecimento semântico otimizado (redução de ruído)
                const headerContext = `# ${section.header}${chunk.header && chunk.header !== section.header ? `\n## ${chunk.header}` : ""}`;
                
                const meta = chunk.metadata;
                const chunkTextLower = chunk.text.toLowerCase();
                
                // Extração cirúrgica de termos de alta relevância (evita repetir o que já está no texto e frases longas)
                const relevantTerms = [
                    ...meta.bold.fragments,
                    ...meta.italic.fragments,
                    ...meta.code.fragments
                ]
                .filter(term => term.length >= 3 && term.length <= 35) // Apenas palavras-chave, não frases completas
                .filter(term => !chunkTextLower.includes(term.toLowerCase())) // Evita redundância
                .filter((v, i, a) => a.indexOf(v) === i); // Unicidade

                const footer = relevantTerms.length > 0 
                    ? `\n\nTAGS: ${relevantTerms.join(", ")}` 
                    : "";
                
                const augmentedText = `${headerContext}\n\n${chunk.text}${footer}`;

                entries.push({
                    id: `${sessionId}-chunk-${idx}`,
                    text: augmentedText,
                    metadata: { 
                        type: "text", 
                        section: section.header,
                        header: chunk.header,
                        page: section.page_start, 
                        order: chunk.order, 
                        chunk_index: idx++,
                        ast_metadata: chunk.metadata
                    },
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
