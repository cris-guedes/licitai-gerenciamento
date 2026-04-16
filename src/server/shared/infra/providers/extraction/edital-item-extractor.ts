import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { EmbeddingProvider } from "@/server/shared/infra/providers/vector/embedding-provider";
import { FlatVectorStore } from "@/server/shared/infra/providers/vector/flat-vector-store";

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type EditalItemExtractorResult = {
    itens:           Array<any>;
    tokensUsed:      { prompt: number; completion: number; total: number };
    tablesProcessed: number;
    totalHits:       number;
};

// ─── Schema de extração de itens ──────────────────────────────────────────────

export const EDITAL_ITEM_SCHEMA = z.object({
    itens: z.array(z.object({
        numero:                  z.number().nullable().describe("Número do item. Na falta, retorne null."),
        lote:                    z.string().nullable().describe("Apenas se o edital for dividido em Lotes/Grupos. Senão, null."),
        descricao:               z.string().describe("Descrição do item, material ou serviço."),
        tipo:                    z.enum(["material", "servico"]).nullable().describe("Classificação se o item é um material ou prestação de serviço."),
        quantidade:              z.number().nullable().describe("Quantidade solicitada (apenas números). Se houver ponto de milhar p.ex '240.000', retorne 240000. Se for decimal '240,50', retorne 240.50."),
        unidade:                 z.string().nullable().describe("Unidade de medida: UN, KG, L, PAR, CX, etc."),
        valor_unitario_estimado: z.number().nullable().describe("Preço estimado único unitário. Numeros com casas decimais usam ponto (ex: 15.50)."),
        valor_total_estimado:    z.number().nullable().describe("Preço total do item (unitário x qty)."),
        catmat_catser:           z.string().nullable().describe("Código CATMAT ou CATSER do produto. Se não houver, null."),
        criterio_julgamento:    z.string().nullable().describe("Critério específico de julgamento do item (Ex: Menor Preço, Maior Desconto)."),
        beneficio_tributario:   z.string().nullable().describe("Informações sobre benefícios tributários (Ex: Margem de preferência)."),
        observacao:            z.string().nullable().describe("Observações relevantes sobre o item."),
        descricao_ncm_nbs:      z.string().nullable().describe("Descrição do NCM ou NBS associado."),
    })),
});

// ─── Queries de busca focadas em tabelas de itens ─────────────────────────────

const ITEM_SEARCH_QUERIES = [
    "tabela de itens relação de produtos serviços lotes quantidades",
    "termo de referência lista especificações dos itens",
    "código item descrição unidade de fornecimento quantidade valor unitário",
    "planilha proposta de preços máximos",
];

// ─── Prompt do sistema ─────────────────────────────────────────────────────────

const ITEM_EXTRACTOR_PROMPT = `Você é um robô puramente funcional e focado em converter tabelas parciais de Markdown para um array JSON estruturado de Itens de Licitação.

REGRAS RÍGIDAS DE EXTRAÇÃO:
- Identifique a Tabela PRINCIPAL de Itens Licitados fornecida (Termo de Referência).
- Cada linha útil da tabela representa 1 Item.
- Documente descrições NCM/NBS se encontrá-las atreladas ao item.
- Valores monetários devem ser Numbers (Ex: "R$ 1.500,50" -> 1500.50).
- Quantidades com ponto de milhar (ex: "240.000") devem ser 240000.
- NUNCA invente itens. Extraia RIGOROSAMENTE as células traduzidas pro schema.
- Se o trecho de markdown NÃO for a tabela principal de objeto/preços, devolva itens: [].`;

// ─── Extrator de itens a partir de tabelas ────────────────────────────────────

export class EditalItemExtractor {
    private embeddingCache = new Map<string, Float32Array>();
    private readonly llmBatchSize = Number(process.env.EDITAL_ITEM_LLM_BATCH_SIZE ?? (process.env.VERCEL ? "3" : "8"));

    constructor(
        private readonly embeddingProvider: EmbeddingProvider.Contract,
        private readonly vectorStore:       FlatVectorStore.Contract,
    ) {}

    async warmupEmbeddings(): Promise<void> {
        const queriesToEmbed = ITEM_SEARCH_QUERIES.filter(q => !this.embeddingCache.has(q));
        if (queriesToEmbed.length > 0) {
            const embs = await this.embeddingProvider.embedMany(queriesToEmbed, true);
            queriesToEmbed.forEach((q, i) => this.embeddingCache.set(q, embs[i] as Float32Array));
        }
    }

    async extract(onProgress?: EditalItemExtractor.ProgressFn): Promise<EditalItemExtractorResult> {
        const startTime = Date.now();
        await this.warmupEmbeddings();

        // 1. Busca semântica focada em tabelas de itens
        const queryEmbeddings = ITEM_SEARCH_QUERIES.map(q => this.embeddingCache.get(q)!);
        const semanticHits    = this.vectorStore.multiQuerySearch(queryEmbeddings, 40, 0.25);

        // Filtrar apenas blocos markdown de tabela completa
        const tableHits       = semanticHits.filter(hit => hit.metadata.type === "table_md");
        const uniqueTableHits = Array.from(new Map(tableHits.map(item => [item.id, item])).values());

        console.log(`[EditalItemExtractor] ${uniqueTableHits.length} tabelas relevantes encontradas.`);

        if (uniqueTableHits.length === 0) {
            onProgress?.("Nenhuma tabela de itens encontrada", 63);
        } else {
            onProgress?.(`${uniqueTableHits.length} tabela(s) de itens encontrada(s)`, 63);
        }

        // 2. Extração em lotes de 3 para evitar rate limit
        let totalPrompt     = 0;
        let totalCompletion = 0;
        const allParsedItems: any[] = [];

        const batches      = chunk(uniqueTableHits, this.llmBatchSize);
        const totalBatches = batches.length;
        // Distribui 63-80% pelos lotes de itens
        const pctStart = 63;
        const pctRange = 17; // 63 → 80

        for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
            const batch      = batches[batchIdx]!;
            const batchNum   = batchIdx + 1;
            const pctCurrent = Math.round(pctStart + (batchIdx / Math.max(totalBatches, 1)) * pctRange);

            onProgress?.(
                `Extraindo itens: lote ${batchNum}/${totalBatches} (${batch.length} tabela${batch.length > 1 ? "s" : ""})`,
                pctCurrent,
            );

            const batchResults = await Promise.all(
                batch.map(async hit => {
                    try {
                        const { object, usage } = await generateObject({
                            model:       createOpenAI({ apiKey: process.env.OPENAI_API_KEY })(process.env.OPENAI_MODEL ?? "gpt-4o-mini"),
                            schema:      EDITAL_ITEM_SCHEMA,
                            system:      ITEM_EXTRACTOR_PROMPT,
                            prompt:      `=== TRECHO DA TABELA ===\n\n${hit.text}`,
                            temperature: 0,
                        });
                        if (usage) {
                            totalPrompt     += usage.inputTokens ?? 0;
                            totalCompletion += usage.outputTokens ?? 0;
                        }

                        console.log(`[EditalItemExtractor] Tabela ${hit.id} extraída: ${object.itens?.length ?? 0} itens brutos.`);

                        return object.itens ?? [];
                    } catch (error: any) {
                        console.warn(`[EditalItemExtractor] Falha na tabela: ${error.message}`);
                        return [];
                    }
                }),
            );
            batchResults.forEach(items => allParsedItems.push(...items));
        }

        // 3. Deduplicação por descrição + quantidade
        const uniqueItemsMap = new Map<string, any>();
        for (const item of allParsedItems) {
            if (!item?.descricao || item.quantidade === 0) continue;
            const key      = `${item.descricao.toLowerCase().trim()}|${item.quantidade}`;
            const existing = uniqueItemsMap.get(key);

            if (!existing) {
                uniqueItemsMap.set(key, item);
            } else {
                const score = (i: any) => 
                    (i.unidade ? 1 : 0) + 
                    (i.valor_unitario_estimado ? 1 : 0) + 
                    (i.numero ? 1 : 0) +
                    (i.tipo ? 1 : 0) +
                    (i.catmat_catser ? 1 : 0);
                if (score(item) > score(existing)) uniqueItemsMap.set(key, item);
            }
        }
        const deduplicatedItems = Array.from(uniqueItemsMap.values());

        const elapsedMs = Date.now() - startTime;
        console.log(
            `[EditalItemExtractor] ${deduplicatedItems.length} itens únicos (de ${allParsedItems.length} parseados) em ${uniqueTableHits.length} tabelas (${elapsedMs}ms).`,
        );

        const itemLabel = deduplicatedItems.length === 1 ? "item extraído" : "itens extraídos";
        onProgress?.(`${deduplicatedItems.length} ${itemLabel}`, 82);

        return {
            itens:           deduplicatedItems,
            tokensUsed:      { prompt: totalPrompt, completion: totalCompletion, total: totalPrompt + totalCompletion },
            tablesProcessed: uniqueTableHits.length,
            totalHits:       semanticHits.length,
        };
    }
}

export namespace EditalItemExtractor {
    export type ProgressFn = (message: string, percent: number) => void;
}

// ─── Utilidade interna ────────────────────────────────────────────────────────

function chunk<T>(arr: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size),
    );
}
