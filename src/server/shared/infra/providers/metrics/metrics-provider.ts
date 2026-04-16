import { performance } from "perf_hooks";
import { EventEmitter } from "events";
import pino from "pino";


export class MetricsProvider {
    private logger: any;
    private emitter = new EventEmitter();

    constructor() {
        if (pino) this.logger = pino({ level: process.env.LOG_LEVEL ?? "info" });
        else this.logger = console;
    }

    info(msg: string, meta?: Record<string, unknown>) {
        if (this.logger && typeof this.logger.info === "function") return this.logger.info(meta ?? {}, msg);
        if (this.logger && typeof this.logger.log === "function") return this.logger.log(msg, meta);
    }
    debug(msg: string, meta?: Record<string, unknown>) {
        if (this.logger && typeof this.logger.debug === "function") return this.logger.debug(meta ?? {}, msg);
        if (this.logger && typeof this.logger.log === "function") return this.logger.log(msg, meta);
    }
    error(msg: string, meta?: Record<string, unknown>) {
        if (this.logger && typeof this.logger.error === "function") return this.logger.error(meta ?? {}, msg);
        if (this.logger && typeof this.logger.log === "function") return this.logger.log(msg, meta);
    }

    startTimer(name: string) {
        const t0 = performance.now();
        return (meta?: Record<string, unknown>) => {
            const duration = performance.now() - t0;
            const data = { name, durationMs: duration, ...(meta ?? {}) };
            if (this.logger && typeof this.logger.info === "function") this.logger.info(data, `metric:${name}`);
            else if (this.logger && typeof this.logger.log === "function") this.logger.log(`metric:${name}`, data);
            this.emitter.emit("metric", data);
            return duration;
        };
    }

    onMetric(fn: (data: { name: string; durationMs: number } & Record<string, unknown>) => void) {
        this.emitter.on("metric", fn as (...args: unknown[]) => void);
    }
}

export namespace MetricsProvider { export type Contract = MetricsProvider; }
