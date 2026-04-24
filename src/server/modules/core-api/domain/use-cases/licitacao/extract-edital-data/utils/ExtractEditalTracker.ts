import type { PdfIngestionWorker } from "@/server/modules/core-api/workers/pdf-ingestion/PdfIngestionWorker";
import { MetricsProvider } from "@/server/shared/infra/providers/metrics/metrics-provider";
import { ExtractEditalData } from "../ExtractEditalData";

export class ExtractEditalTracker {
    private mainTimer: ReturnType<MetricsProvider.Contract["startTimer"]>;

    constructor(
        private readonly metrics: MetricsProvider.Contract,
        private readonly reportFn: (event: ExtractEditalData.ProgressEvent) => void
    ) {
        this.mainTimer = this.metrics.startTimer("orchestration:total");
    }

    finishTotal(meta?: Record<string, unknown>) {
        this.reportFn({ step: "orchestration.total", message: "Extração concluída!", percent: 100 });
        return this.mainTimer(meta);
    }

    emitMap() {
        this.reportFn({ step: "orchestration.map", message: "Mapeando para o modelo de domínio...", percent: 88 });
    }

    emitSave(documentId: string) {
        this.reportFn({ step: "orchestration.save", message: `Persistindo artefatos da sessão ${documentId}...`, percent: 95 });
    }

    // ─── Steps ────────────────────────────────────────────────────────────────

    prepareQueries(scope: "info" | "items") {
        const label = scope === "info" ? "campos" : "itens";
        this.reportFn({ step: `${scope}.prepare_queries`, message: `Preparando consultas semânticas de ${label}...`, percent: 5 });
        const timer = this.metrics.startTimer(`${scope}:prepare_queries`);
        return {
            done: () => {
                const time = timer();
                this.reportFn({ step: `${scope}.prepare_queries`, message: `Consultas de ${label} preparadas`, percent: 10 });
                return time;
            }
        };
    }

    ingest(scope: "info" | "items"): PdfIngestionWorker.IngestionProgress & { done: () => number } {
        const label = scope === "info" ? "texto e contexto" : "linhas de tabela";
        this.reportFn({ step: `${scope}.ingest`, message: `Processando ${label}...`, percent: 15 });
        const timer = this.metrics.startTimer(`${scope}:ingest`);
        return {
            onParsed: (ms) => {
                this.reportFn({ step: `${scope}.ingest.parse`, message: `${label} convertidos em chunks (${Math.round(ms)} ms)`, percent: 28 });
            },
            onEmbedded: (count) => {
                this.reportFn({ step: `${scope}.ingest.embed`, message: `Embeddings gerados para ${count} fragmentos de ${label}`, percent: 40 });
            },
            onStored: () => {
                this.reportFn({ step: `${scope}.ingest.store`, message: `Indexação vetorial de ${label} concluída`, percent: 50 });
            },
            done: () => timer(),
        };
    }

    extractInfo() {
        this.reportFn({ step: "info.extract", message: "Extraindo campos do edital...", percent: 55 });
        const timer = this.metrics.startTimer("info:extract");
        return {
            relay: (message: string, percent: number) => this.reportFn({ step: "info.extract", message, percent }),
            done: () => {
                const time = timer();
                this.reportFn({ step: "info.extract", message: "Campos extraídos com sucesso", percent: 70 });
                return time;
            }
        };
    }

    extractItens() {
        this.reportFn({ step: "items.extract", message: "Extraindo itens do edital...", percent: 72 });
        const timer = this.metrics.startTimer("items:extract");
        return {
            relay: (message: string, percent: number) => this.reportFn({ step: "items.extract", message, percent }),
            done: (count: number) => {
                const time = timer();
                this.reportFn({ step: "items.extract", message: `${count} itens extraídos`, percent: 85 });
                return time;
            }
        };
    }
}
