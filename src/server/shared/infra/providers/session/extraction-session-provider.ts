import fs from "fs/promises";
import path from "path";
import type { ProcessedChunk } from "@/server/modules/core-api/domain/data/ProcessedChunk";

const TEMP_BASE_DIR = path.join(process.cwd(), "temp");
const DATASET_FILE = path.join(TEMP_BASE_DIR, "dataset.json");

export class ExtractionSessionProvider {
    newSessionId(): string {
        return crypto.randomUUID();
    }

    tempDirFor(sessionId: string): string {
        return path.join(TEMP_BASE_DIR, sessionId);
    }

    async save(data: ExtractionSessionProvider.SessionData): Promise<void> {
        const tempDir = this.tempDirFor(data.sessionId);
        await fs.mkdir(tempDir, { recursive: true });

        const json = (obj: any) => JSON.stringify(obj, null, 2);

        await Promise.all([
            // Documento original
            fs.writeFile(path.join(tempDir, "original.pdf"), data.pdfBuffer),
            fs.writeFile(path.join(tempDir, "content.md"), data.mdContent, "utf8"),

            // Resultado bruto do parser (antes do embedding) — para debug de perda de chunks
            fs.writeFile(path.join(tempDir, "parsed-text.json"), json(formatParsedEntries(data.parsedTextEntries)), "utf8"),
            fs.writeFile(path.join(tempDir, "parsed-tables.json"), json(formatParsedEntries(data.parsedTableEntries)), "utf8"),
            fs.writeFile(path.join(tempDir, "parsed-text.md"), formatParsedEntriesAsMarkdown(data.parsedTextEntries, "Chunks de Texto"), "utf8"),
            fs.writeFile(path.join(tempDir, "parsed-tables.md"), formatParsedEntriesAsMarkdown(data.parsedTableEntries, "Linhas de Tabela"), "utf8"),

            // Payloads enviados para cada extrator (o que a IA realmente viu)
            fs.writeFile(path.join(tempDir, "field-payloads.json"), json(data.fieldPayloads), "utf8"),
            fs.writeFile(path.join(tempDir, "item-payloads.json"), json(data.itemPayloads), "utf8"),

            // Resultado bruto de cada extrator (o que a IA respondeu)
            fs.writeFile(path.join(tempDir, "raw-fields.json"), json(data.rawFields), "utf8"),
            fs.writeFile(path.join(tempDir, "raw-items.json"), json(data.rawItems), "utf8"),

            // Resultado final mapeado para o domínio
            fs.writeFile(path.join(tempDir, "extraction.json"), json(data.extraction), "utf8"),

            // Métricas de performance
            fs.writeFile(path.join(tempDir, "metrics.json"), json(data.metrics), "utf8"),

            // Configuração da busca (reprodutibilidade)
            fs.writeFile(path.join(tempDir, "search-queries.json"), json(data.searchQueries), "utf8"),
            fs.writeFile(path.join(tempDir, "qdrant-config.json"), json(data.qdrantConfig), "utf8"),

            // Dataset global
            this.appendToDataset(data),
        ]);

        console.log(`[Audit Trail] Sessão ${data.sessionId} salva em ${tempDir}`);
    }

    private async appendToDataset(data: ExtractionSessionProvider.SessionData): Promise<void> {
        const metrics = data.metrics as any;
        const extraction = data.extraction as any;
        const edital = extraction?.edital ?? extraction ?? {};
        const orgao = edital.orgao_gerenciador ?? {};
        const itens: any[] = data.rawItems ?? [];

        const entry: ExtractionSessionProvider.DatasetEntry = {
            sessionId: data.sessionId,
            timestamp: metrics.timestamp ?? new Date().toISOString(),
            pdfUrl: metrics.pdfUrl ?? "",
            numero: edital.numero ?? null,
            modalidade: edital.modalidade ?? null,
            objeto_resumido: edital.objeto_resumido ?? null,
            orgao_nome: orgao.nome ?? null,
            total_itens: itens.length,
            fieldPayloadsCount: data.fieldPayloads.length,
            itemPayloadsCount: data.itemPayloads.length,
            totalTimeMs: metrics.totalTimeMs ?? 0,
            tokensUsed: metrics.tokensUsed ?? { prompt: 0, completion: 0, total: 0 },
        };

        let dataset: ExtractionSessionProvider.DatasetEntry[] = [];
        try {
            const raw = await fs.readFile(DATASET_FILE, "utf8");
            dataset = JSON.parse(raw);
        } catch {
            // arquivo ainda não existe — começa vazio
        }

        const idx = dataset.findIndex(e => e.sessionId === entry.sessionId);
        if (idx >= 0) dataset[idx] = entry;
        else dataset.push(entry);

        await fs.mkdir(TEMP_BASE_DIR, { recursive: true });
        await fs.writeFile(DATASET_FILE, JSON.stringify(dataset, null, 2), "utf8");
        console.log(`[Dataset] Atualizado — ${dataset.length} entradas → ${DATASET_FILE}`);
    }
}

function formatParsedEntries(entries: ProcessedChunk[]): object {
    const byPage: Record<number, number> = {};
    for (const e of entries) {
        const page = e.metadata.page;
        byPage[page] = (byPage[page] ?? 0) + 1;
    }
    return {
        _summary: {
            total: entries.length,
            pages: Object.keys(byPage).map(Number).sort((a, b) => a - b),
            byPage,
        },
        entries: entries.map((e, i) => ({
            index: i,
            page: e.metadata.page,
            origin: e.metadata.origin,
            wordCount: e.metadata.word_count,
            content: e.content,
        })),
    };
}

function parseRowFields(text: string): Record<string, string> {
    const fields: Record<string, string> = {};
    for (const part of text.split(" | ")) {
        const sep = part.indexOf(": ");
        if (sep === -1) continue;
        fields[part.slice(0, sep).trim()] = part.slice(sep + 2).trim();
    }
    return fields;
}

function entriesToMarkdownTable(entries: ProcessedChunk[]): string {
    const allKeys: string[] = [];
    const keySet = new Set<string>();
    const parsed = entries.map(e => parseRowFields(e.content));

    for (const fields of parsed) {
        for (const key of Object.keys(fields)) {
            if (!keySet.has(key)) { keySet.add(key); allKeys.push(key); }
        }
    }

    if (allKeys.length === 0) return entries.map(e => `- ${e.content}`).join("\n");

    const escape = (s: string) => s.replace(/\|/g, "\\|");
    const sep = `| --- | ${allKeys.map(() => "---").join(" | ")} |`;
    const header = `| # | ${allKeys.map(escape).join(" | ")} |`;
    const rows = parsed.map((fields, i) =>
        `| ${entries[i].metadata.chunk_index} | ${allKeys.map(k => escape(fields[k] ?? "")).join(" | ")} |`
    );

    return [header, sep, ...rows].join("\n");
}

function formatParsedEntriesAsMarkdown(entries: ProcessedChunk[], title: string): string {
    const byPage = new Map<number, ProcessedChunk[]>();
    for (const e of entries) {
        const page = e.metadata.page;
        if (!byPage.has(page)) byPage.set(page, []);
        byPage.get(page)!.push(e);
    }
    const sortedPages = Array.from(byPage.keys()).sort((a, b) => a - b);

    const lines: string[] = [];
    lines.push(`# ${title}`);
    lines.push('');
    lines.push(`**Total:** ${entries.length} entradas`);
    lines.push('');
    lines.push('| Página | Entradas |');
    lines.push('|--------|----------|');
    for (const page of sortedPages) {
        lines.push(`| ${page} | ${byPage.get(page)!.length} |`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');

    for (const page of sortedPages) {
        const group = byPage.get(page)!;
        lines.push(`## Página ${page} — ${group[0]?.metadata.origin ?? ''} (${group.length} entradas)`);
        lines.push('');
        lines.push(entriesToMarkdownTable(group));
        lines.push('');
    }

    return lines.join('\n');
}

export namespace ExtractionSessionProvider {
    export type SessionData = {
        sessionId: string;
        pdfBuffer: Buffer;
        mdContent: string;
        parsedTextEntries: ProcessedChunk[];
        parsedTableEntries: ProcessedChunk[];
        fieldPayloads: Record<string, any>[];
        itemPayloads: Record<string, any>[];
        rawFields: any;                     // Resposta bruta da IA (campos)
        rawItems: any[];                   // Resposta bruta da IA (itens)
        extraction: unknown;                 // Resultado final mapeado
        metrics: object;                  // Métricas de performance
        searchQueries: {                        // Queries usadas na busca vetorial
            field: string[];
            item: string[];
        };
        qdrantConfig: {                        // Config do Qdrant (reprodutibilidade)
            collection: string;
            documentId: string;
            fieldSearchLimit: number;
            fieldScoreThreshold: number;
            itemSearchLimit: number;
            itemScoreThreshold: number;
            itemTypeFilter: string[];
        };
    };

    export type DatasetEntry = {
        sessionId: string;
        timestamp: string;
        pdfUrl: string;
        numero: string | null;
        modalidade: string | null;
        objeto_resumido: string | null;
        orgao_nome: string | null;
        total_itens: number;
        fieldPayloadsCount: number;
        itemPayloadsCount: number;
        totalTimeMs: number;
        tokensUsed: { prompt: number; completion: number; total: number };
    };
}

