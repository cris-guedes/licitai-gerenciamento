import type { PdfIngestionWorker } from "@/server/modules/core-api/workers/pdf-ingestion/PdfIngestionWorker";
import { MetricsProvider } from "@/server/shared/infra/providers/metrics/metrics-provider";
import { ExtractEditalData } from "../ExtractEditalData";

export class ExtractEditalTracker {
    private mainTimer: ReturnType<MetricsProvider.Contract["startTimer"]>;

    constructor(
        private readonly metrics: MetricsProvider.Contract,
        private readonly reportFn: (event: ExtractEditalData.ProgressEvent) => void
    ) {
        this.mainTimer = this.metrics.startTimer("extract_total");
    }

    finishTotal(meta?: Record<string, unknown>) {
        this.reportFn({ step: "extract_total", message: "Extração concluída!", percent: 100 });
        return this.mainTimer(meta);
    }

    emitMap() {
        this.reportFn({ step: "map", message: "Mapeando para o modelo de domínio...", percent: 88 });
    }

    emitSave(documentId: string) {
        this.reportFn({ step: "save", message: `Finalizando Documento ${documentId}...`, percent: 95 });
    }

    // ─── Steps ────────────────────────────────────────────────────────────────

    prepareQueries() {
        this.reportFn({ step: "prepare_queries", message: "Preparando inteligência de busca...", percent: 5 });
        const timer = this.metrics.startTimer("prepare_queries");
        return {
            done: () => {
                const time = timer();
                this.reportFn({ step: "prepare_queries", message: "Buscadores preparados", percent: 10 });
                return time;
            }
        };
    }

    ingest(): PdfIngestionWorker.IngestionProgress & { done: () => number } {
        this.reportFn({ step: "ingest", message: "Processando PDF...", percent: 15 });
        const timer = this.metrics.startTimer("ingest");
        return {
            onParsed: (ms) => {
                this.reportFn({ step: "ingest_parse", message: "PDF convertido em chunks", percent: 28 });
            },
            onEmbedded: (count) => {
                this.reportFn({ step: "ingest_embed", message: `Embeddings gerados para ${count} fragmentos`, percent: 40 });
            },
            onStored: () => {
                this.reportFn({ step: "ingest_store", message: "Armazenamento vetorial concluído", percent: 50 });
            },
            done: () => timer(),
        };
    }

    extractInfo() {
        this.reportFn({ step: "extract_info", message: "Extraindo campos do edital...", percent: 55 });
        const timer = this.metrics.startTimer("extract_info");
        return {
            relay: (message: string, percent: number) => this.reportFn({ step: "extract_info", message, percent }),
            done: () => {
                const time = timer();
                this.reportFn({ step: "extract_info", message: "Campos extraídos com sucesso", percent: 70 });
                return time;
            }
        };
    }

    extractItens() {
        this.reportFn({ step: "extract_itens", message: "Extraindo itens do edital...", percent: 72 });
        const timer = this.metrics.startTimer("extract_itens");
        return {
            relay: (message: string, percent: number) => this.reportFn({ step: "extract_itens", message, percent }),
            done: (count: number) => {
                const time = timer();
                this.reportFn({ step: "extract_itens", message: `${count} itens extraídos`, percent: 85 });
                return time;
            }
        };
    }
}
