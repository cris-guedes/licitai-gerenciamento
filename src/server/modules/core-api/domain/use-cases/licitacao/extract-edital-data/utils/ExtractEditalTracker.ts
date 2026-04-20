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

    // Retorna o tempo total ao final
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

    emitPartialInfo(data: any, licitacao: any) {
        this.reportFn({ step: "extract_info_done", message: "Campos extraídos", percent: 70, partialData: { type: "fields", data, licitacao } });
    }

    emitPartialItemBatch(items: any[], batchIndex: number, totalBatches: number) {
        const percent = 72 + Math.round(((batchIndex + 1) / totalBatches) * 12);
        this.reportFn({ step: "extract_itens_batch", message: `Extraindo itens: lote ${batchIndex + 1} de ${totalBatches}`, percent, partialData: { type: "items_batch", items, batchIndex, totalBatches } });
    }

    emitPartialItems(data: any) {
        this.reportFn({ step: "extract_itens_done", message: "Itens extraídos", percent: 85, partialData: { type: "items_final", data } });
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

    parse() {
        this.reportFn({ step: "parse", message: "Convertendo PDF para texto...", percent: 15 });
        const timer = this.metrics.startTimer("parse");
        return {
            done: (meta: { sessionId: string; apiMs: number }) => {
                const time = timer(meta);
                this.reportFn({ step: "parse", message: "PDF convertido", percent: 30 });
                return time;
            }
        };
    }

    embed() {
        this.reportFn({ step: "embed", message: "Gerando embeddings do documento...", percent: 35 });
        const timer = this.metrics.startTimer("embed");
        return {
            done: (count: number) => {
                const time = timer();
                this.reportFn({ step: "embed", message: `Embeddings gerados para ${count} fragmentos`, percent: 42 });
                return time;
            }
        };
    }

    store() {
        this.reportFn({ step: "store", message: "Armazenando contexto semântico...", percent: 45 });
        const timer = this.metrics.startTimer("store");
        return {
            done: () => {
                const time = timer();
                this.reportFn({ step: "store", message: "Armazenamento vetorial concluído", percent: 50 });
                return time;
            }
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
            relayBatch: (items: any[], batchIndex: number, totalBatches: number) => this.emitPartialItemBatch(items, batchIndex, totalBatches),
            done: (count: number) => {
                const time = timer();
                this.reportFn({ step: "extract_itens", message: `${count} itens extraídos`, percent: 85 });
                return time;
            }
        };
    }
}
