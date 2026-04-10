import { create, insert, search, type AnyOrama } from "@orama/orama";

type Entry = {
    id: string;
    embedding: Float32Array;
    text?: string;
    metadata?: Record<string, unknown>;
};

export class InMemoryVectorStore {
    private db: AnyOrama | null = null;

    private async ensureInited() {
        if (!this.db) {
            this.db = await create({
                schema: {
                    vec: "vector[384]",
                    text: "string",
                    metadata: "string",
                    docId: "string",
                },
            });
        }
    }

    async upsert(entries: Entry[]) {
        await this.ensureInited();
        
        console.log(`[InMemoryVectorStore] Inserindo ${entries.length} entradas...`);
        for (const e of entries) {
            await insert(this.db!, {
                vec: Array.from(e.embedding),
                text: e.text || "",
                metadata: JSON.stringify(e.metadata || {}),
                docId: e.id,
            });
        }
        console.log(`[InMemoryVectorStore] Inserção concluída.`);
    }

    async similaritySearch(queryEmbedding: Float32Array, topK = 5) {
        await this.ensureInited();

        const vectorValue = Array.from(queryEmbedding);
        console.log(`[InMemoryVectorStore] Buscando... Query vector (5 primeiros): ${vectorValue.slice(0, 5).join(", ")}`);

        try {
            const results = await search(this.db!, {
                mode: "vector",
                vector: {
                    value: vectorValue,
                    property: "vec",
                },
                similarity: 0, 
                limit: topK,
            });

            console.log(`[InMemoryVectorStore] Busca finalizada. Hits: ${results.hits?.length ?? 0}`);
            
            if (!results.hits || results.hits.length === 0) {
                console.log(`[InMemoryVectorStore] FALLBACK detectado: Nenhuma batida vetorial.`);
                const all = await search(this.db!, { limit: topK });
                console.log(`[InMemoryVectorStore] Total documentos no índice: ${all.count}`);
                
                return (all.hits || []).map(hit => {
                    const doc = hit.document as any;
                    return {
                        id: doc.docId,
                        score: 0,
                        text: doc.text,
                        metadata: doc.metadata ? JSON.parse(doc.metadata) : {},
                    };
                });
            }

            return results.hits.map(hit => {
                const doc = hit.document as any;
                return {
                    id: doc.docId,
                    score: hit.score,
                    text: doc.text,
                    metadata: doc.metadata ? JSON.parse(doc.metadata) : {},
                };
            });
        } catch (error) {
            console.error(`[InMemoryVectorStore] Erro na busca vetorial:`, error);
            // Fallback total em caso de erro crítico
            const all = await search(this.db!, { limit: topK });
            return (all.hits || []).map(hit => {
                const doc = hit.document as any;
                return {
                    id: doc.docId,
                    score: 0,
                    text: doc.text,
                    metadata: doc.metadata ? JSON.parse(doc.metadata) : {},
                };
            });
        }
    }

    async size() {
        return 0;
    }
}

export namespace InMemoryVectorStore {
    export type Contract = InMemoryVectorStore;
}
