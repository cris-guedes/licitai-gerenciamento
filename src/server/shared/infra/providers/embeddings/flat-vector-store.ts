type Entry = {
    id:        string;
    embedding: Float32Array;
    text?:     string;
    metadata?: Record<string, unknown>;
};

type SearchResult = {
    id:       string;
    score:    number;
    text:     string | undefined;
    metadata: Record<string, unknown>;
};

/**
 * FlatVectorStore — busca vetorial em memória com dot-product puro.
 *
 * Para vetores normalizados (normalize: true no Xenova), dot-product
 * equivale a cosine similarity e é matematicamente exato — sem
 * approximation errors de índices HNSW ou problemas de schema (Orama).
 *
 * Para ~200 chunks × 384 dims: ~77k ops por busca, << 1ms.
 */
export class FlatVectorStore {
    private entries: Entry[] = [];

    upsert(newEntries: Entry[]): void {
        for (const entry of newEntries) {
            const idx = this.entries.findIndex(e => e.id === entry.id);
            if (idx >= 0) {
                this.entries[idx] = entry;
            } else {
                this.entries.push(entry);
            }
        }
        console.log(`[FlatVectorStore] Total de entradas: ${this.entries.length}`);
    }

    /**
     * Busca single-query: retorna os topK mais similares.
     */
    similaritySearch(queryEmbedding: Float32Array, topK = 5): SearchResult[] {
        if (this.entries.length === 0) return [];

        const scored = this.entries.map(entry => ({
            id:       entry.id,
            score:    this.dotProduct(queryEmbedding, entry.embedding),
            text:     entry.text,
            metadata: entry.metadata ?? {},
        }));

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, topK);
    }

    /**
     * Multi-query search: embeda cada query separadamente e combina
     * os resultados mantendo o MAIOR score por chunk (max-fusion).
     * Retorna topK chunks únicos ordenados por score decrescente.
     */
    multiQuerySearch(queryEmbeddings: Float32Array[], topK = 15): SearchResult[] {
        if (this.entries.length === 0) return [];

        const scoreMap = new Map<string, SearchResult>();

        for (const qEmb of queryEmbeddings) {
            for (const entry of this.entries) {
                const score = this.dotProduct(qEmb, entry.embedding);
                const existing = scoreMap.get(entry.id);
                if (!existing || score > existing.score) {
                    scoreMap.set(entry.id, {
                        id:       entry.id,
                        score,
                        text:     entry.text,
                        metadata: entry.metadata ?? {},
                    });
                }
            }
        }

        const combined = Array.from(scoreMap.values());
        combined.sort((a, b) => b.score - a.score);
        return combined.slice(0, topK);
    }

    size(): number {
        return this.entries.length;
    }

    clear(): void {
        this.entries = [];
    }

    private dotProduct(a: Float32Array, b: Float32Array): number {
        let sum = 0;
        const len = Math.min(a.length, b.length);
        for (let i = 0; i < len; i++) {
            sum += a[i] * b[i];
        }
        return sum;
    }
}

export namespace FlatVectorStore {
    export type Contract = FlatVectorStore;
}
