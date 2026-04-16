import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { EmbeddingProvider } from "@/server/shared/infra/providers/embeddings/embedding-provider";
import { FlatVectorStore, type SearchResult } from "@/server/shared/infra/providers/embeddings/flat-vector-store";

export type TableItemExtractorResult = {
  itens: Array<any>;
  tokensUsed: { prompt: number; completion: number; total: number };
  tablesProcessed: number;
  totalHits: number;
};

// Schema extremamente direcionado e simplificado para lidar perfeitamente
// com linhas de produtos em planilhas de editais.
export const EXTRACTION_SCHEMA_ITENS = z.object({
  itens: z.array(z.object({
    numero: z.number().nullable().describe("Número do item. Na falta, retorne null."),
    lote: z.string().nullable().describe("Apenas se o edital for dividido em Lotes/Grupos. Senão, null."),
    descricao: z.string().describe("Descrição do item, material ou serviço."),
    quantidade: z.number().nullable().describe("Quantidade solicitada (apenas números). Se houver ponto de milhar p.ex '240.000', retorne 240000. Se for decimal '240,50', retorne 240.50."),
    unidade: z.string().nullable().describe("Unidade de medida: UN, KG, L, PAR, CX, etc."),
    valor_unitario_estimado: z.number().nullable().describe("Preço estimado único unitário. Numeros com casas decimais usam ponto (ex: 15.50)."),
    valor_total_estimado: z.number().nullable().describe("Preço total do item (unitário x qty)."),
    catmat_catser: z.string().nullable().describe("Código CATMAT ou CATSER do produto. Se não houver, null.")
  }))
});

const ITEM_QUERIES = [
  "tabela de itens relação de produtos serviços lotes quantidades",
  "termo de referência lista especificações dos itens",
  "código item descrição unidade de fornecimento quantidade valor unitário",
  "planilha proposta de preços máximos",
];

const SYSTEM_PROMPT = `Você é um robô puramente funcional e focado em converter tabelas parciais de Markdown para um array JSON estruturado de Itens de Licitação.

REGRAS RÍGIDAS DE EXTRAÇÃO:
- Identifique a Tabela PRINCIPAL de Itens Licitados fornecida (Termo de Referência).
- NÃO extraia itens de tabelas que sejam de locais de entrega, cronogramas físico-financeiros, ou distribuição por escolas/secretarias. Se a tabela parece mostrar "locais" ou "quantidades fracionadas por local", retorne itens: [].
- Cada linha útil da tabela representa 1 Item.
- ignore sumários ou cabeçalhos.
- Valores monetários devem ser Numbers (Ex: "R$ 1.500,50" -> 1500.50).
- Quantidades com ponto de milhar (ex: "240.000") devem ser 240000.
- NUNCA invente itens. Extraia RIGOROSAMENTE as células traduzidas pro schema.
- Se o trecho de markdown NÃO for a tabela principal de objeto/preços, devolva itens: [].`;

export class TableItemExtractorAgent {
  private embeddingCache = new Map<string, Float32Array>();

  constructor(
    private readonly embeddingProvider: EmbeddingProvider.Contract,
    private readonly vectorStore: FlatVectorStore.Contract
  ) {}

  async warmupEmbeddings() {
    const queriesToEmbed = ITEM_QUERIES.filter(q => !this.embeddingCache.has(q));
    if (queriesToEmbed.length > 0) {
      const embs = await this.embeddingProvider.embedMany(queriesToEmbed, true);
      queriesToEmbed.forEach((q, i) => this.embeddingCache.set(q, embs[i] as Float32Array));
    }
  }

  async extract(): Promise<TableItemExtractorResult> {
    const startTime = Date.now();
    await this.warmupEmbeddings();

    // 1. Busca Semântica
    const queryEmbeddings = await Promise.all(
      ITEM_QUERIES.map(q => this.embeddingCache.get(q)!)
    );

    // Priorizamos um teto (ex: max 30 pedaços de tabela que combinem com iten/preço)
    // Usamos um threshold mais exigente (0.35) para filtrar lixo ou cronogramas
    const semanticHits = this.vectorStore.multiQuerySearch(queryEmbeddings, 40, 0.35);
    
    // Filtrar especificamente blocos de MD "tabela completa" (se houver, gerado lá pelo documentParser)
    // Se o doc.tables no ExtraEditalData já usou 'table_md' no metadado, aqui o encontraremos
    const tableHits = semanticHits.filter(hit => hit.metadata.type === "table_md");
    
    // Dedup por ID (uma mesma tabela pode ser atingida por 2 queries diferentes)
    const uniqueTableHits = Array.from(new Map(tableHits.map(item => [item.id, item])).values());

    console.log(`[TableItemExtractorAgent] Recuperou ${uniqueTableHits.length} tabelas relevantes.`);

    // 2. Extração usando Batch (Concorrência customizada para evitar rate-limits pesados)
    let totalPrompt = 0;
    let totalCompletion = 0;
    const allParsedItems: any[] = [];
    
    // Função utilitária para "limitar" promessas rodando em lotes de "n"
    const chunkArray = <T>(arr: T[], size: number): T[][] => 
      Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
      );

    const batches = chunkArray(uniqueTableHits, 3); // De 3 em 3 tabelas at a time

    for (const batch of batches) {
      const batchPromises = batch.map(async (hit) => {
        try {
          const { object, usage } = await generateObject({
            model: createOpenAI({ apiKey: process.env.OPENAI_API_KEY })(process.env.OPENAI_MODEL ?? "gpt-4o-mini"),
            schema: EXTRACTION_SCHEMA_ITENS,
            system: SYSTEM_PROMPT,
            prompt: `=== TRECHO DA TABELA ===\n\n${hit.text}`,
            temperature: 0,
          });
          
          if (usage) {
            totalPrompt += usage.inputTokens;
            totalCompletion += usage.outputTokens;
          }

          if (object.itens && Array.isArray(object.itens)) {
            return object.itens;
          }
          return [];
        } catch (error: any) {
          console.warn(`[TableItemExtractorAgent] Falha no chunk: ${error.message}`);
          return [];
        }
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(res => allParsedItems.push(...res));
    }

    // Deduplication step: multiple queries might hit the same item across different tables or sections.
    const uniqueItemsMap = new Map<string, any>();
    for (const item of allParsedItems) {
      if (!item || !item.descricao || item.quantidade === 0) continue; // skip empty or invalid items

      // Key based on description and quantity to avoid smashing different valid items together
      const descKey = `${item.descricao.toLowerCase().trim()}|${item.quantidade}`;

      if (!uniqueItemsMap.has(descKey)) {
        uniqueItemsMap.set(descKey, item);
      } else {
        const existing = uniqueItemsMap.get(descKey);
        // Prefer the item that actually has a unit and a value, or has 'numero'
        const existingScore = (existing.unidade ? 1 : 0) + (existing.valor_unitario_estimado ? 1 : 0) + (existing.numero ? 1 : 0);
        const newScore = (item.unidade ? 1 : 0) + (item.valor_unitario_estimado ? 1 : 0) + (item.numero ? 1 : 0);
        
        if (newScore > existingScore) {
          uniqueItemsMap.set(descKey, item);
        }
      }
    }
    const deduplicatedItems = Array.from(uniqueItemsMap.values());

    const elapsedMs = Date.now() - startTime;
    console.log(`[TableItemExtractorAgent] Extraiu ${deduplicatedItems.length} itens únicos (de ${allParsedItems.length} parseados) de ${uniqueTableHits.length} tabelas agrupadas (${elapsedMs}ms).`);

    return {
      itens: deduplicatedItems,
      tokensUsed: { prompt: totalPrompt, completion: totalCompletion, total: totalPrompt + totalCompletion },
      tablesProcessed: uniqueTableHits.length,
      totalHits: semanticHits.length,
    };
  }
}
