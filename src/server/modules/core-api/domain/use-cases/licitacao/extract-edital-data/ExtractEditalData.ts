import type { ProcessPdfResponse } from "@/server/shared/lib/document-handler/DocumentHandlerClient";
import { DocumentHandlerFileParsingProvider } from "@/server/shared/infra/providers/pdf/document-handler-file-parsing-provider";
import { EditalIndexingService } from "@/server/shared/infra/providers/extraction/edital-indexing-service";
import { EditalFieldExtractor } from "@/server/shared/infra/providers/extraction/edital-field-extractor";
import { EditalItemExtractor } from "@/server/shared/infra/providers/extraction/edital-item-extractor";
import { MetricsProvider } from "@/server/shared/infra/providers/metrics/metrics-provider";
import { ExtractionSessionProvider } from "@/server/shared/infra/providers/session/extraction-session-provider";
import { ExtractEditalDataControllerSchemas } from "./ExtractEditalDataControllerSchemas";
import { EditalExtractionMapper } from "./dtos/EditalExtractionMapper";
import type { EditalFieldExtractorResult } from "@/server/shared/infra/providers/extraction/edital-field-extractor";
import type { EditalItemExtractorResult } from "@/server/shared/infra/providers/extraction/edital-item-extractor";

export class ExtractEditalData {
    constructor(
        private readonly documentParser: DocumentHandlerFileParsingProvider.Contract,
        private readonly indexingService: EditalIndexingService.Contract,
        private readonly fieldExtractor: EditalFieldExtractor,
        private readonly itemExtractor: EditalItemExtractor,
        private readonly metricsProvider: MetricsProvider.Contract,
        private readonly sessionStorage: ExtractionSessionProvider,
    ) { }

    async execute(input: ExtractEditalData.Input): Promise<ExtractEditalData.Output> {
        const sessionId = this.sessionStorage.newSessionId();
        const totalTimer = this.metricsProvider.startTimer("extract_total");
        const report = input.onProgress ?? (() => { });
        const lowMemoryMode = Boolean(process.env.VERCEL);

        // 0. Aquecer as queries de campo e itens em plano de fundo AGORA
        // Isso roda enquanto o PDF está sendo processado na nuvem!
        const warmupPromise = (lowMemoryMode
            ? (async () => {
                await this.fieldExtractor.warmupEmbeddings();
                await this.itemExtractor.warmupEmbeddings();
            })()
            : Promise.all([
                this.fieldExtractor.warmupEmbeddings(),
                this.itemExtractor.warmupEmbeddings(),
            ])
        ).catch(err => console.error("[ExtractEditalData] Erro ignorável no warmup:", err));

        // 1. Parse PDF → seções e tabelas estruturadas
        report({ step: "parse", message: "Convertendo PDF para texto...", percent: 10 });
        const tParse = this.metricsProvider.startTimer("parse_pdf");
        const { response, wallTimeMs: apiTimeMs } = await this.documentParser.process(input.pdfBuffer, input.pdfUrl);
        const conversionTimeMs = tParse({ sessionId, apiMs: apiTimeMs });
        report({ step: "parse", message: "PDF convertido", percent: 30 });

        // 2. Chunking + embedding + indexação
        report({ step: "index", message: "Indexando conteúdo...", percent: 35 });
        const tIndex = Date.now();
        const { entriesCount } = await this.indexingService.index(response, sessionId);
        const indexingTimeMs = Date.now() - tIndex;
        const totalWords = response.total_words.toLocaleString("pt-BR");
        report({ step: "index", message: `Texto processado: ${totalWords} palavras, ${entriesCount} fragmentos indexados`, percent: 50 });

        // Garante que o warmup disparado lá em cima terminou (geralmente isso termina muito antes do Parse de PDF acabar)
        await warmupPromise;

        // 3. Extração paralela: campos semânticos + itens de tabela
        report({ step: "extract", message: "Iniciando extrações (campos e itens) em paralelo...", percent: 55 });
        const tExtract = Date.now();

        const progressRelay = (message: string, percent: number) =>
            report({ step: "extract", message, percent });

        const [fields, items] = lowMemoryMode
            ? [
                await this.fieldExtractor.extract(progressRelay),
                await this.itemExtractor.extract(progressRelay),
            ]
            : await Promise.all([
                this.fieldExtractor.extract(progressRelay),
                this.itemExtractor.extract(progressRelay),
            ]);
        const extractionTimeMs = Date.now() - tExtract;
        report({ step: "extract", message: "Dados extraídos", percent: 85 });

        // 4. Mapear para o modelo de domínio
        report({ step: "map", message: "Mapeando para o modelo de domínio...", percent: 88 });
        const licitacao = EditalExtractionMapper.toLicitacao(fields.extraction, items.itens);

        // 5. Montar métricas
        const metrics = this.buildMetrics({
            sessionId,
            pdfUrl: input.pdfUrl,
            response,
            entriesCount,
            conversionTimeMs,
            indexingTimeMs,
            extractionTimeMs,
            totalTimeMs: totalTimer({ sessionId }),
            fields,
            items,
        });

        // 6. Persistir sessão
        report({ step: "save", message: "Finalizando...", percent: 95 });
        const mdContent = response.sections
            .flatMap(s => s.chunks.map(c => c.text))
            .join("\n\n---\n\n");

       /* await this.sessionStorage.save({
            sessionId,
            pdfBuffer: input.pdfBuffer,
            mdContent,
            filteredMd: mdContent,
            chunks: fields.hits as any,
            topChunks: fields.hits as any,
            rawFields: fields.extraction,
            rawItems: items.itens,
            extraction: licitacao as any,
            metrics,
        });*/

        return { sessionId, mdContent, licitacao, metrics };
    }

    // ─── Helpers privados ─────────────────────────────────────────────────────

    private buildMetrics(args: {
        sessionId: string;
        pdfUrl?: string;
        response: ProcessPdfResponse;
        entriesCount: number;
        conversionTimeMs: number;
        indexingTimeMs: number;
        extractionTimeMs: number;
        totalTimeMs: number;
        fields: EditalFieldExtractorResult;
        items: EditalItemExtractorResult;
    }): ExtractEditalDataControllerSchemas.Metrics {
        const { sessionId, pdfUrl, response, entriesCount, conversionTimeMs, indexingTimeMs, extractionTimeMs, totalTimeMs, fields, items } = args;

        return {
            sessionId,
            timestamp: new Date().toISOString(),
            pdfUrl: pdfUrl ?? "upload-direto",
            pdfFilename: response.filename,
            pdfFileSizeBytes: response.file_size_bytes,
            totalChars: response.total_chars,
            totalWords: response.total_words,
            totalTables: response.total_tables,
            entriesIndexed: entriesCount,
            conversionTimeMs,
            indexingTimeMs,
            extractionTimeMs,
            totalTimeMs,
            tempDir: this.sessionStorage.tempDirFor(sessionId),
            tokensUsed: {
                prompt: fields.tokensUsed.prompt + items.tokensUsed.prompt,
                completion: fields.tokensUsed.completion + items.tokensUsed.completion,
                total: fields.tokensUsed.total + items.tokensUsed.total,
            },
            config: {
                embeddingModel: this.indexingService.modelName,
                aiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
                fileParser: this.documentParser.constructor.name,
                extractionMode: "VectorAgent+Items",
                totalQueries: fields.searchesPerformed,
            },
        };
    }
}

export namespace ExtractEditalData {
    export type ProgressEvent = {
        step: string;
        message: string;
        percent: number;
    };

    export interface Input {
        pdfBuffer: Buffer;
        pdfUrl?: string;  // opcional — usado apenas nas métricas/sessão
        onProgress?: (event: ProgressEvent) => void;
    }

    export type Output = ExtractEditalDataControllerSchemas.Output;
}
