import PQueue from "p-queue";
import type { IPromiseProvider } from "@/server/modules/core-api/domain/data/IPromiseProvider";

export class PQueuePromiseProvider implements IPromiseProvider {
    async runAll<T>(tasks: (() => Promise<T>)[], concurrency: number): Promise<T[]> {
        if (tasks.length === 0) return [];
        
        // Se concorrência for 1, executa sequencialmente para economizar recursos
        if (concurrency <= 1) {
            const results: T[] = [];
            for (const task of tasks) {
                results.push(await task());
            }
            return results;
        }

        const queue = new PQueue({ concurrency });
        return queue.addAll(tasks);
    }
}
