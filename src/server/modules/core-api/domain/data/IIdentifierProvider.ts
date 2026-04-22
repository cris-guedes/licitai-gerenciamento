export interface IIdentifierProvider {
    /**
     * Gera um identificador único universal (UUID v4).
     */
    generate(): string;
}

export namespace IIdentifierProvider {
    export type Contract = IIdentifierProvider;
}
