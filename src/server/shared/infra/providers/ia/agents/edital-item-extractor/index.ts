import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type { IAgent, IExtractionResult } from "@/server/modules/core-api/domain/data/IAgent";
import { EDITAL_ITEM_SCHEMA } from "./schemas";
import { ITEM_EXTRACTOR_PROMPT, buildItemExtractionPrompt } from "./prompts";
import { ITEM_EXTRACTOR_CONFIG } from "./config";

export class EditalItemExtractorAgent implements IAgent<Record<string, any>[], any[]> {
    private readonly openai: ReturnType<typeof createOpenAI>;

    constructor() {
        this.openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    getSearchQueries(): string[] {
        return [
            // Table header patterns — high precision, match any segment of an item table
            "ITEM DESCRIÇÃO UNIDADE QUANTIDADE VALOR UNITÁRIO VALOR TOTAL LOTE CÓDIGO",
            "LOTE ORDEM CÓDIGO DESCRIÇÃO UNID QUANT VALOR UNITÁRIO VALOR TOTAL ESTIMADO",
            // Catalog code headers — CATMAT/CATSER tables
            "CATMAT CATSER CÓDIGO SIAD ELEMENTO DESPESA UNIDADE AQUISIÇÃO QUANTIDADE ESTIMADA",
            // Data row patterns — materials/medicines (numeric codes + product names + units)
            "medicamento material hospitalar comprimido frasco ampola cápsula solução unidade quantidade valor",
            // Data row patterns — services/equipment
            "serviço manutenção locação fornecimento equipamento item unidade mensal anual valor unitário estimado",
        ];
    }

    async extract(payloads: Record<string, any>[], _onProgress?: (message: string, percent: number) => void, onPartialResult?: (partial: any[], batchIndex: number, totalBatches: number) => void): Promise<IExtractionResult<any[]>> {
        const { llmBatchSize } = ITEM_EXTRACTOR_CONFIG;

        if (payloads.length === 0) {
            return { data: [], metrics: { tokensUsed: { prompt: 0, completion: 0, total: 0 } } };
        }

        // Find canonical headers: the first group that has real column names (not data values).
        // Multi-page table continuations use the first data row as "headers" — detect and skip those.
        const isRealHeader = (h: unknown): boolean =>
            Array.isArray(h) && h.length > 0 && !h.some((v: unknown) => /^\d+$/.test(String(v).trim()));

        let canonicalHeaders: string[] | null = null;
        const seen = new Set<string>();
        for (const p of payloads) {
            const key = `${p.page ?? 0}_${p.table_index ?? 0}`;
            if (!seen.has(key)) {
                seen.add(key);
                if (!canonicalHeaders && isRealHeader(p.headers)) {
                    canonicalHeaders = p.headers as string[];
                }
            }
        }

        // Sort all rows by position, then batch by row count (not by table segment).
        // This merges ~50 tiny segments into fewer larger batches, reducing LLM calls.
        const sorted = [...payloads].sort((a, b) => {
            if ((a.page ?? 0) !== (b.page ?? 0)) return (a.page ?? 0) - (b.page ?? 0);
            if ((a.table_index ?? 0) !== (b.table_index ?? 0)) return (a.table_index ?? 0) - (b.table_index ?? 0);
            return (a.row_index ?? 0) - (b.row_index ?? 0);
        });

        const batches: { rows: Record<string, any>[]; headers: string[] | null }[] = [];
        for (let i = 0; i < sorted.length; i += llmBatchSize) {
            const rows = sorted.slice(i, i + llmBatchSize);
            // Use canonical headers for all batches; fall back to the batch's own first-row headers
            const batchHeaders = canonicalHeaders ?? (isRealHeader(rows[0]?.headers) ? rows[0].headers as string[] : null);
            batches.push({ rows, headers: batchHeaders });
        }

        console.log(`[EditalItemExtractorAgent] ${payloads.length} rows → ${batches.length} batches (batchSize=${llmBatchSize}, parallel)`);

        const results: { items: any[]; usage: { prompt: number; completion: number } }[] = new Array(batches.length);

        // Dedup compartilhado para emissão progressiva — seguro pois callbacks .then() são serializados no event loop.
        const streamSeenNums = new Set<number>();
        const streamSeenDescs = new Set<string>();

        await Promise.all(batches.map((b, i) =>
            this.extractBatch(b.rows, b.headers).then(result => {
                results[i] = result;
                if (onPartialResult && result.items.length > 0) {
                    const newItems = result.items.filter(item => {
                        if (item.numero != null) {
                            if (streamSeenNums.has(item.numero)) return false;
                            streamSeenNums.add(item.numero);
                            return true;
                        }
                        const key = (item.descricao ?? "").toLowerCase().replace(/\s+/g, " ").trim().slice(0, 80);
                        if (key && streamSeenDescs.has(key)) return false;
                        if (key) streamSeenDescs.add(key);
                        return true;
                    });
                    if (newItems.length > 0) onPartialResult(newItems, i, batches.length);
                }
            })
        ));

        const allItems: any[] = [];
        let totalPrompt = 0, totalCompletion = 0;
        for (const r of results) {
            allItems.push(...r.items);
            totalPrompt += r.usage.prompt;
            totalCompletion += r.usage.completion;
        }

        // Deduplicate: by item number when available, by normalized description otherwise
        const seenNums = new Set<number>();
        const seenDescs = new Set<string>();
        const merged = allItems.filter(item => {
            if (item.numero != null) {
                if (seenNums.has(item.numero)) return false;
                seenNums.add(item.numero);
                return true;
            }
            const key = (item.descricao ?? "").toLowerCase().replace(/\s+/g, " ").trim().slice(0, 80);
            if (key && seenDescs.has(key)) return false;
            if (key) seenDescs.add(key);
            return true;
        });

        console.log(`[EditalItemExtractorAgent] ${merged.length} itens únicos extraídos de ${batches.length} batches.`);

        return {
            data: merged,
            metrics: {
                tokensUsed: {
                    prompt: totalPrompt,
                    completion: totalCompletion,
                    total: totalPrompt + totalCompletion,
                },
            },
        };
    }

    private rowToMarkdown(text: string, colCount: number): string {
        try {
            const obj = JSON.parse(text);
            if (obj && typeof obj === "object" && !Array.isArray(obj)) {
                const maxKey = Math.max(...Object.keys(obj).map(Number).filter(n => !isNaN(n)));
                const cols = Array.from({ length: Math.max(maxKey + 1, colCount) }, (_, i) => String(obj[i] ?? "").replace(/\|/g, "\\|"));
                return `| ${cols.join(" | ")} |`;
            }
        } catch { /* not JSON, return as-is */ }
        return text;
    }

    private async extractBatch(rows: Record<string, any>[], injectedHeaders?: string[] | null): Promise<{ items: any[]; usage: { prompt: number; completion: number } }> {
        const lines: string[] = [];
        const headers = injectedHeaders ?? (Array.isArray(rows[0]?.headers) ? rows[0].headers : null);
        const colCount = headers ? headers.length : 0;
        if (headers && colCount > 0) {
            lines.push(`| ${headers.join(" | ")} |`);
            lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
        }
        for (const row of rows) {
            lines.push(this.rowToMarkdown(row.text ?? "", colCount));
        }
        const context = lines.join("\n");

        try {
            const { object, usage } = await generateObject({
                model: this.openai(ITEM_EXTRACTOR_CONFIG.model),
                schema: EDITAL_ITEM_SCHEMA,
                system: ITEM_EXTRACTOR_PROMPT,
                prompt: buildItemExtractionPrompt(context),
                temperature: ITEM_EXTRACTOR_CONFIG.temperature,
            });

            return {
                items: object.itens ?? [],
                usage: { prompt: usage?.inputTokens ?? 0, completion: usage?.outputTokens ?? 0 },
            };
        } catch (error: any) {
            console.warn(`[EditalItemExtractorAgent] Batch falhou, retentando 1x: ${error.message}`);
            try {
                const { object, usage } = await generateObject({
                    model: this.openai(ITEM_EXTRACTOR_CONFIG.model),
                    schema: EDITAL_ITEM_SCHEMA,
                    system: ITEM_EXTRACTOR_PROMPT,
                    prompt: buildItemExtractionPrompt(context),
                    temperature: ITEM_EXTRACTOR_CONFIG.temperature + 0.1,
                });
                return {
                    items: object.itens ?? [],
                    usage: { prompt: usage?.inputTokens ?? 0, completion: usage?.outputTokens ?? 0 },
                };
            } catch (err2: any) {
                console.error(`[EditalItemExtractorAgent] Batch falhou definitivamente: ${err2.message}`);
                return { items: [], usage: { prompt: 0, completion: 0 } };
            }
        }
    }
}
