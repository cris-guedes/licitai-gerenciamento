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
     * Retorna TODAS as entradas que satisfaçam o filtro de metadados.
     */
    listByMetadata(predicate: (metadata: Record<string, any>) => boolean): SearchResult[] {
        return this.entries
            .filter(e => predicate(e.metadata ?? {}))
            .map(e => ({
                id: e.id,
                score: 1.0, // Score máximo para listagem direta
                text: e.text,
                metadata: e.metadata ?? {},
            }));
    }

    /**
     * Busca single-query: retorna os topK mais similares.
     */
    similaritySearch(queryEmbedding: Float32Array, topK = 5, minScore = 0): SearchResult[] {
        if (this.entries.length === 0) return [];

        const scored = this.entries.map(entry => ({
            id:       entry.id,
            score:    this.dotProduct(queryEmbedding, entry.embedding),
            text:     entry.text,
            metadata: entry.metadata ?? {},
        }))
        .filter(e => e.score >= minScore);

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, topK);
    }

    /**
     * Multi-query search: embeda cada query separadamente e combina
     * os resultados mantendo o MAIOR score por chunk (max-fusion).
     * Retorna topK chunks únicos que atingiram o minScore.
     */
    multiQuerySearch(queryEmbeddings: Float32Array[], topK = 15, minScore = 0): SearchResult[] {
        if (this.entries.length === 0) return [];

        const scoreMap = new Map<string, SearchResult>();

        for (const qEmb of queryEmbeddings) {
            for (const entry of this.entries) {
                const score = this.dotProduct(qEmb, entry.embedding);
                if (score < minScore) continue;

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
