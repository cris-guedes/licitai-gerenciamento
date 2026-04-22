export interface IPromiseProvider {
    /**
     * Executa uma lista de tarefas com uma concorrência específica.
     * @param tasks Array de funções que retornam Promises.
     * @param concurrency Máximo de tarefas simultâneas.
     */
    runAll<T>(tasks: (() => Promise<T>)[], concurrency: number): Promise<T[]>;
}

export namespace IPromiseProvider {
    export type Contract = IPromiseProvider;
}
