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
        this.emit("orchestration", "orchestration.total", "Extração concluída!", 100, 100);
        return this.mainTimer(meta);
    }

    emitMap() {
        this.emit("orchestration", "orchestration.map", "Mapeando para o modelo de domínio...", 88, 88);
    }

    emitSave(documentId: string) {
        this.emit("orchestration", "orchestration.save", `Persistindo artefatos da sessão ${documentId}...`, 95, 95);
    }

    // ─── Steps ────────────────────────────────────────────────────────────────

    prepareQueries(scope: "info" | "items") {
        const label = scope === "info" ? "campos" : "itens";
        this.emit(scope, `${scope}.prepare_queries`, `Preparando consultas semânticas de ${label}...`, 5, 12);
        const timer = this.metrics.startTimer(`${scope}:prepare_queries`);
        return {
            done: () => {
                const time = timer();
                this.emit(scope, `${scope}.prepare_queries`, `Consultas de ${label} preparadas`, 10, 22);
                return time;
            }
        };
    }

    ingest(scope: "info" | "items"): PdfIngestionWorker.IngestionProgress & { done: () => number } {
        const label = scope === "info" ? "texto e contexto" : "linhas de tabela";
        this.emit(scope, `${scope}.ingest`, `Processando ${label}...`, 15, 28);
        const timer = this.metrics.startTimer(`${scope}:ingest`);
        return {
            onParsed: (ms) => {
                this.emit(scope, `${scope}.ingest.parse`, `${label} convertidos em chunks (${Math.round(ms)} ms)`, 28, 45);
            },
            onEmbedded: (count) => {
                this.emit(scope, `${scope}.ingest.embed`, `Embeddings gerados para ${count} fragmentos de ${label}`, 40, 62);
            },
            onStored: () => {
                this.emit(scope, `${scope}.ingest.store`, `Indexação vetorial de ${label} concluída`, 50, 78);
            },
            done: () => timer(),
        };
    }

    extractInfo() {
        this.emit("info", "info.extract", "Extraindo campos do edital...", 55, 84);
        const timer = this.metrics.startTimer("info:extract");
        return {
            relay: (message: string, percent: number) => this.emit("info", "info.extract", message, percent, 92),
            done: () => {
                const time = timer();
                this.emit("info", "info.extract", "Campos extraídos com sucesso", 70, 100);
                return time;
            }
        };
    }

    extractItens() {
        this.emit("items", "items.extract", "Extraindo itens do edital...", 72, 84);
        const timer = this.metrics.startTimer("items:extract");
        return {
            relay: (message: string, percent: number) => this.emit("items", "items.extract", message, percent, 88),
            done: (count: number) => {
                const time = timer();
                this.emit("items", "items.extract", `${count} itens extraídos`, 85, 100);
                return time;
            }
        };
    }

    private emit(
        scope: ExtractEditalData.ProgressEvent["scope"],
        step: string,
        message: string,
        percent: number,
        pipelinePercent?: number,
    ) {
        this.reportFn({
            type: "progress",
            scope,
            step,
            message,
            percent,
            pipelinePercent,
        });
    }
}
