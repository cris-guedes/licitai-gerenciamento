import crypto from "crypto";
import { EditalExtractionProvider } from "@/server/shared/infra/providers/ai/edital-extraction/edital-extraction-provider";
import { FileParsingProvider } from "@/server/shared/infra/providers/file-parsing/file-parsing-provider";
import { ChunkingProvider } from "@/server/shared/infra/providers/chunking/chunking-provider";
import { EmbeddingProvider } from "@/server/shared/infra/providers/embeddings/embedding-provider";
import { FlatVectorStore } from "@/server/shared/infra/providers/embeddings/flat-vector-store";
import { MetricsProvider } from "@/server/shared/infra/providers/metrics/metrics-provider";
import { ExtractionSessionProvider } from "@/server/shared/infra/providers/session/extraction-session-provider";
import { ChunkPostProcessing } from "@/server/shared/infra/providers/chunking/chunk-post-processing";
import { HttpDownloadProvider } from "@/server/shared/infra/providers/download/download-provider";
import { CryptoProvider } from "@/server/shared/infra/providers/crypto/crypto-provider";
import { ExtractEditalDataControllerSchemas } from "./ExtractEditalDataControllerSchemas";
import { ChunkedDocumentResultItem } from "@/server/shared/lib/docling";


export class ExtractEditalData {
    constructor(
        private readonly fileParser: FileParsingProvider.Contract,
        private readonly chunker: ChunkingProvider.Contract,
        private readonly chunkPostProcessing: ChunkPostProcessing,
        private readonly embeddingProvider: EmbeddingProvider.Contract,
        private readonly vectorStore: FlatVectorStore.Contract,
        private readonly aiExtractor: EditalExtractionProvider,
        private readonly metricsProvider: MetricsProvider.Contract,
        private readonly sessionStorage: ExtractionSessionProvider,
        private readonly downloadProvider: HttpDownloadProvider.Contract,
        private readonly cryptoProvider: CryptoProvider,
        private readonly chunkSize: number,
        private readonly chunkOverlap: number
    ) { }

    async execute(request: ExtractEditalData.Params): Promise<ExtractEditalData.Response> {
        let { pdfUrl, pdfBuffer, sessionId: existingSessionId, mode = "balanceado" } = request;
        const sessionId = existingSessionId ?? crypto.randomUUID();

        const totalTimer = this.metricsProvider.startTimer("extract_total");

        // 1) Garantir Buffer do PDF
        let pdfFileSizeBytes = pdfBuffer?.byteLength ?? 0;
        if (!pdfBuffer && pdfUrl) {
            const downloadTimer = this.metricsProvider.startTimer("download_pdf");
            const downloaded = await this.downloadProvider.download(pdfUrl);
            pdfBuffer = downloaded.buffer;
            pdfFileSizeBytes = downloaded.sizeBytes;
            downloadTimer({ sessionId });
        }

        if (!pdfBuffer) {
            throw new Error("É necessário fornecer pdfBuffer ou pdfUrl");
        }

        // 2) Pipeline de Processamento (Parse -> Chunk -> Embed -> VectorStore)
        const pipelineResult = await this.documentProcessingPipeline(sessionId, pdfBuffer, pdfUrl, mode);
        const { mdContent, chunks, chunkCount, filteredMd, mdFileSizeBytes, mdWordCount, doclingFilename, conversionTimeMs, chunkingTimeMs } = pipelineResult;

        // 3) AI extraction (Multi-step RAG)
        const extractionTimer = this.metricsProvider.startTimer("extraction");
        const { extraction, tokensUsed, topChunks: extractionTopChunks, topKPorIntent, queriesPorIntent } = await this.performMultiStepExtraction(sessionId, mdContent);
        const extractionTimeMs = extractionTimer({ sessionId });

        const metrics: ExtractEditalDataControllerSchemas.Metrics = {
            sessionId,
            timestamp: new Date().toISOString(),
            pdfUrl: pdfUrl || "buffer-upload",
            pdfFileSizeBytes,
            conversionTimeMs,
            chunkingTimeMs,
            scoringTimeMs: 0, // Legado do pipeline antigo
            filteredChunkCount: chunks.length,
            extractionTimeMs,
            totalTimeMs: totalTimer({ sessionId }),
            mdFileSizeBytes,
            mdWordCount,
            chunkCount,
            doclingFilename,
            tempDir: this.sessionStorage.tempDirFor(sessionId),
            tokensUsed,
            config: {
                chunkSize: this.chunkSize,
                chunkOverlap: this.chunkOverlap,
                embeddingModel: this.embeddingProvider.MODEL_NAME,
                aiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
                fileParser: this.fileParser.constructor.name,
                extractionMode: mode,
                topKPorIntent,
                queriesPorIntent,
            },
            topChunks: extractionTopChunks.flatMap(t => t.hits.map(h => ({
                id: h.id,
                score: h.score,
                headings: h.metadata?.headings as string[] ?? [],
                charCount: h.text?.length ?? 0,
                preview: h.text?.slice(0, 100) ?? ""
            }))).slice(0, 50),
        };

        const finalExtraction = extraction as ExtractEditalData.Response["extraction"];

        await this.sessionStorage.save({
            sessionId,
            pdfBuffer,
            mdContent,
            filteredMd,
            chunks,
            topChunks: extractionTopChunks as any,
            extraction: finalExtraction,
            metrics
        });

        return { sessionId, mdContent, extraction: finalExtraction, metrics };
    }

    private async documentProcessingPipeline(sessionId: string, pdfBuffer: Buffer, pdfUrl: string, mode: ExtractEditalData.ExtractionMode = "balanceado") {
        this.vectorStore.clear();

        // 1. Parsing
        const convertTimer = this.metricsProvider.startTimer("convert_pdf_to_md");
        const { mdContent, doclingFilename, conversionTimeMs: convTimeFromParser, mdFileSizeBytes, mdWordCount } =
            await this.fileParser.convertPdfToMarkdown({ pdfUrl, pdfBuffer, mode });
        const conversionTimeMs = convertTimer({ sessionId, parserMs: convTimeFromParser });

        // 2. Chunking
        const chunkTime = this.metricsProvider.startTimer("chunking");
        const { chunks: rawChunks, processingTimeMs: chunkingTimeMs } =
            await this.chunker.chunkMarkdown({ mdContent, chunkSize: this.chunkSize, chunkOverlap: this.chunkOverlap });
        chunkTime({ sessionId, chunkCount: rawChunks.length });

        // 3. Post-processing (Dedup/Clean)
        const { chunks, removedCount } = this.chunkPostProcessing.run(rawChunks);
        const chunkCount = chunks.length;
        console.log(`[ExtractEditalData] Chunks após dedup: ${chunkCount} (removidos: ${removedCount})`);

        // 4. Indexing (Embeddings)
        const embedingTime = this.metricsProvider.startTimer("embedding");
        const embeddings = await this.embeddingProvider.embedMany(chunks.map((c: ChunkedDocumentResultItem) => c.text));
        const normalized = this.normalizeChunks(chunks);
        const entries = this.buildVectorEntries(normalized, embeddings, sessionId);
        this.vectorStore.upsert(entries);
        embedingTime({ sessionId, chunkCount });

        return {
            chunks,
            chunkCount,
            chunkingTimeMs,
            filteredMd: mdContent,
            topChunks: [],
            mdContent,
            doclingFilename,
            conversionTimeMs,
            mdFileSizeBytes,
            mdWordCount
        };
    }

    private normalizeChunks(chunks: any[]): ChunkedDocumentResultItem[] {
        return (chunks ?? []).map((c: any, i: number) => ({
            filename: c.filename ?? "document.md",
            chunk_index: c.chunk_index ?? i,
            text: String(c.text ?? ""),
            headings: c.headings ?? null,
            doc_items: c.doc_items ?? [],
        }));
    }

    private buildVectorEntries(chunks: ChunkedDocumentResultItem[], embeddings: Float32Array[] | number[][], sessionId: string) {
        return chunks.map((c, i) => ({
            id: `${sessionId}-${String(i)}`,
            embedding: embeddings[i] as Float32Array,
            text: c.text,
            metadata: { headings: c.headings, chunk_index: c.chunk_index },
        }));
    }

    private async performMultiStepExtraction(sessionId: string, fullMd: string) {
        const intents = [
            { name: "identificacao",   runner: this.aiExtractor.identificacao() },
            { name: "datas_disputa",   runner: this.aiExtractor.datasDisputa() },
            { name: "prazos_logistica", runner: this.aiExtractor.prazosLogistica() },
            { name: "documentos",      runner: this.aiExtractor.documentos() },
            { name: "regras",          runner: this.aiExtractor.regras() },
            { name: "garantia",        runner: this.aiExtractor.garantia() },
        ];

        const [ragResult, itensResult] = await Promise.all([
            this.executeMultiStepRAG(intents),
            this.extractItensInBatches(),
        ]);

        // Injetar itens no resultado merged
        ragResult.extraction.edital.itens = itensResult.itens;

        // Somar tokens dos lotes de itens
        ragResult.tokensUsed.prompt     += itensResult.tokensUsed.prompt;
        ragResult.tokensUsed.completion += itensResult.tokensUsed.completion;
        ragResult.tokensUsed.total      += itensResult.tokensUsed.total;

        ragResult.topKPorIntent["itens"]    = itensResult.batchCount;
        ragResult.queriesPorIntent["itens"] = this.aiExtractor.itens().query;

        return ragResult;
    }

    /**
     * Extrai itens varrendo TODOS os chunks do documento em lotes.
     * Cada lote cabe dentro do MAX_CONTEXT_CHARS.
     * Os arrays de itens de cada lote são mergeados e deduplicados por `numero`.
     */
    private async extractItensInBatches(): Promise<{ itens: any[]; tokensUsed: { prompt: number; completion: number; total: number }; batchCount: number }> {
        const SEP = "\n\n---\n\n";

        // Todos os chunks em ordem de documento
        const allChunks: string[] = (this.vectorStore as any).entries
            .slice()
            .sort((a: any, b: any) => (a.metadata?.chunk_index ?? 0) - (b.metadata?.chunk_index ?? 0))
            .map((e: any) => e.text as string)
            .filter(Boolean);

        // Dividir em lotes
        const batches: string[] = [];
        let current = "";
        for (const chunk of allChunks) {
            if (current.length + chunk.length + SEP.length > ExtractEditalData.MAX_ITEMS_BATCH_CHARS) {
                if (current) batches.push(current);
                current = chunk;
            } else {
                current += (current ? SEP : "") + chunk;
            }
        }
        if (current) batches.push(current);

        console.log(`[ExtractEditalData] extractItensInBatches — ${batches.length} lotes (${allChunks.length} chunks totais)`);

        const runner = this.aiExtractor.itens();

        // Processar lotes sequencialmente — evita rate-limit/timeout de muitas chamadas simultâneas
        const byNumero    = new Map<number | string, any>();
        const totalTokens = { prompt: 0, completion: 0, total: 0 };

        for (let i = 0; i < batches.length; i++) {
            console.log(`[ExtractEditalData] Itens lote ${i + 1}/${batches.length} — ${batches[i].length} chars`);
            const { result, tokensUsed } = await runner.execute(batches[i]);
            totalTokens.prompt     += tokensUsed.prompt;
            totalTokens.completion += tokensUsed.completion;
            totalTokens.total      += tokensUsed.total;

            const itens: any[] = result?.itens ?? [];
            for (const item of itens) {
                const key = item.numero ?? item.descricao ?? Math.random();
                const existing = byNumero.get(key);
                if (!existing) {
                    byNumero.set(key, item);
                } else {
                    // Preferir o item com mais campos não-nulos
                    const score = (o: any) => Object.values(o).filter(v => v !== null && v !== undefined).length;
                    if (score(item) > score(existing)) byNumero.set(key, item);
                }
            }
        }

        const itens = [...byNumero.values()].sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0));
        console.log(`[ExtractEditalData] Itens extraídos após merge: ${itens.length}`);

        return { itens, tokensUsed: totalTokens, batchCount: batches.length };
    }

    // ~100k chars ≈ 25k tokens — limite para intents normais
    private static readonly MAX_CONTEXT_CHARS       = 100_000;
    // ~40k chars ≈ 10k tokens por lote de itens — menor para evitar timeout/rate-limit em lotes paralelos
    private static readonly MAX_ITEMS_BATCH_CHARS   = 40_000;

    private async executeMultiStepRAG(intents: { name: string; runner: any }[]) {
        const firstChunks = (this.vectorStore as any).entries.slice(0, 20).map((e: any) => e.text);

        const results = await Promise.all(
            intents.map(async ({ name, runner }) => {
                console.log(`[ExtractEditalData] Iniciando intent: ${name}...`);
                const queryEmbeddings = await this.embeddingProvider.embedMany(runner.query, true);

                const topK       = name === "itens" ? 500 : 200;
                const vectorHits = this.vectorStore.multiQuerySearch(queryEmbeddings, topK);

                // ORDENAÇÃO: manter ordem original do documento é CRITICAL para tabelas fragmentadas
                const sortedHits = [...vectorHits].sort((a, b) =>
                    ((a.metadata?.chunk_index as number) ?? 0) - ((b.metadata?.chunk_index as number) ?? 0)
                );

                // Construir contexto com cap de caracteres para não explodir o context window
                let context = "";
                const SEP   = "\n\n---\n\n";
                for (const text of [...firstChunks, ...sortedHits.map((h: { text?: string }) => h.text)]) {
                    if (!text) continue;
                    if (context.length + text.length + SEP.length > ExtractEditalData.MAX_CONTEXT_CHARS) break;
                    context += (context ? SEP : "") + text;
                }

                console.log(`[ExtractEditalData] Intent ${name} — contexto: ${context.length} chars (${vectorHits.length} hits)`);

                const { result, tokensUsed } = await runner.execute(context);
                console.log(`[ExtractEditalData] Intent ${name} concluído:`, JSON.stringify(result).substring(0, 200) + "...");

                return { name, topK, result, tokensUsed, hits: vectorHits as any[], queries: runner.query as string[] };
            }),
        );

        const totalTokens = { prompt: 0, completion: 0, total: 0 };
        let mergedExtraction: any = { edital: {} };
        const topChunks: any[] = [];
        const topKPorIntent: Record<string, number> = {};
        const queriesPorIntent: Record<string, string[]> = {};

        for (const res of results) {
            mergedExtraction.edital = this.mergeExtractionResults(mergedExtraction.edital, res.result);
            totalTokens.prompt += res.tokensUsed.prompt;
            totalTokens.completion += res.tokensUsed.completion;
            totalTokens.total += res.tokensUsed.total;
            topChunks.push({ intent: res.name, queries: res.queries, hits: res.hits });
            topKPorIntent[res.name] = res.topK;
            queriesPorIntent[res.name] = res.queries;
        }

        return { extraction: mergedExtraction as any, tokensUsed: totalTokens, topChunks, topKPorIntent, queriesPorIntent };
    }

    private mergeExtractionResults(current: any, update: any) {
        const data = update.edital ? update.edital : update;

        return {
            ...current,
            ...data,
            identificacao: this.mergeDeep(current.identificacao, data.identificacao),
            classificacao: this.mergeDeep(current.classificacao, data.classificacao),
            orgao_gerenciador: this.mergeDeep(current.orgao_gerenciador, data.orgao_gerenciador),
            datas: this.mergeDeep(current.datas, data.datas),
            disputa: this.mergeDeep(current.disputa, data.disputa),
            prazos: this.mergeDeep(current.prazos, data.prazos),
            logistica: this.mergeDeep(current.logistica, data.logistica),
            garantia: this.mergeDeep(current.garantia, data.garantia),
            regras: this.mergeDeep(current.regras, data.regras),
            itens: data.itens || current.itens || [],
            documentos_exigidos: data.documentos_exigidos || current.documentos_exigidos || [],
        };
    }

    private mergeDeep(current: any, update: any) {
        if (!update) return current || {};
        if (!current) return update || {};

        const result = { ...current };
        for (const key in update) {
            if (update[key] !== null && update[key] !== undefined) {
                result[key] = update[key];
            }
        }
        return result;
    }
}

export namespace ExtractEditalData {
    export type ExtractionMode = "velocidade" | "balanceado" | "qualidade" | "imagem";

    export interface Params extends Partial<ExtractEditalDataControllerSchemas.Input> {
        pdfUrl: string;
        pdfBuffer?: Buffer;
        sessionId?: string;
    }

    export type Response = ExtractEditalDataControllerSchemas.Output;
}
