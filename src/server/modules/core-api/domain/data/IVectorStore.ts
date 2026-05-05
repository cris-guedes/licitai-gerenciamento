export namespace IVectorStore {

    // ─── Tipos base ───────────────────────────────────────────────────────────

    export type Point = {
        id:      string | number;
        vector:  Float32Array | number[];
        payload?: Record<string, any>;
    };

    export type ScoredPoint = {
        id:      string | number;
        score:   number;
        payload: Record<string, any>;
    };

    // ─── Filtros ──────────────────────────────────────────────────────────────

    /** Filtra por valor exato num campo do payload (ex.: `document_id = "abc"`). */
    export type MatchValue = { key: string; match: { value: string | number | boolean } };

    /** Filtra por "qualquer um dos valores" num campo (ex.: `type IN ["table_md", "table_row"]`). */
    export type MatchAny   = { key: string; match: { any: (string | number)[] } };

    /** União das condições de filtro suportadas. */
    export type Condition  = MatchValue | MatchAny;

    /** Filtro composto — todos os conditions devem ser satisfeitos (lógica AND). */
    export type Filter     = { must: Condition[] };

    // ─── Opções de busca ──────────────────────────────────────────────────────

    export type SearchOptions = {
        /** Número máximo de resultados por query. */
        limit?:    number;
        /** Filtro de payload aplicado antes do ranqueamento. */
        filter?:   Filter;
        /** Score mínimo de similaridade (0–1) para incluir um resultado. */
        minScore?: number;
    };

    export type ScrollOptions = {
        limit?:  number;
        filter?: Filter;
        offset?: string | number;
    };

    export type ScrollPoint = {
        id:      string | number;
        payload: Record<string, any>;
    };

    // ─── Contrato ─────────────────────────────────────────────────────────────

    export interface Contract {
        /**
         * Garante que a collection existe e está pronta para uso.
         * @param config.vectorSize         Dimensão dos vetores — deve bater com o modelo de embedding.
         * @param config.payloadIndexFields Campos do payload indexados para buscas filtradas eficientes.
         */
        ensureCollection(name: string, config: { vectorSize: number; payloadIndexFields?: string[] }): Promise<void>;

        /** Insere ou atualiza um batch de pontos. */
        upsert(name: string, points: Point[]): Promise<void>;

        /** Busca single-query. */
        search(name: string, vector: number[] | Float32Array, options?: SearchOptions): Promise<ScoredPoint[]>;

        /** Busca multi-query com as mesmas opções aplicadas a cada vetor. */
        searchBatch(name: string, vectors: (number[] | Float32Array)[], options?: SearchOptions): Promise<ScoredPoint[][]>;

        /** Busca paginada sem vetor — retorna todos os pontos que satisfazem o filtro. */
        scroll(name: string, options?: ScrollOptions): Promise<{ points: ScrollPoint[]; nextOffset: string | number | null }>;

        /** Remove pontos com base em um filtro de payload. */
        deleteByFilter(name: string, filter: Filter): Promise<void>;

        /** Remove a collection inteira. */
        deleteCollection(name: string): Promise<void>;
    }
}
