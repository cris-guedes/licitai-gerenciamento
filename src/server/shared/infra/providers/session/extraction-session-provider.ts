import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

const TEMP_BASE_DIR  = path.join(process.cwd(), "temp");
const DATASET_FILE   = path.join(TEMP_BASE_DIR, "dataset.json");

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
            fs.writeFile(path.join(tempDir, "original.pdf"),         data.pdfBuffer),
            fs.writeFile(path.join(tempDir, "content.md"),           data.mdContent, "utf8"),

            // Payloads enviados para cada extrator (o que a IA realmente viu)
            fs.writeFile(path.join(tempDir, "field-payloads.json"),  json(data.fieldPayloads), "utf8"),
            fs.writeFile(path.join(tempDir, "item-payloads.json"),   json(data.itemPayloads),  "utf8"),

            // Resultado bruto de cada extrator (o que a IA respondeu)
            fs.writeFile(path.join(tempDir, "raw-fields.json"),      json(data.rawFields),  "utf8"),
            fs.writeFile(path.join(tempDir, "raw-items.json"),       json(data.rawItems),   "utf8"),

            // Resultado final mapeado para o domínio
            fs.writeFile(path.join(tempDir, "extraction.json"),      json(data.extraction), "utf8"),

            // Métricas de performance
            fs.writeFile(path.join(tempDir, "metrics.json"),         json(data.metrics),    "utf8"),

            // Configuração da busca (reprodutibilidade)
            fs.writeFile(path.join(tempDir, "search-queries.json"),  json(data.searchQueries), "utf8"),
            fs.writeFile(path.join(tempDir, "qdrant-config.json"),   json(data.qdrantConfig),  "utf8"),

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
            sessionId:            data.sessionId,
            timestamp:            metrics.timestamp ?? new Date().toISOString(),
            pdfUrl:               metrics.pdfUrl ?? "",
            numero:               edital.numero ?? null,
            modalidade:           edital.modalidade ?? null,
            objeto_resumido:      edital.objeto_resumido ?? null,
            orgao_nome:           orgao.nome ?? null,
            total_itens:          itens.length,
            fieldPayloadsCount:   data.fieldPayloads.length,
            itemPayloadsCount:    data.itemPayloads.length,
            totalTimeMs:          metrics.totalTimeMs ?? 0,
            tokensUsed:           metrics.tokensUsed ?? { prompt: 0, completion: 0, total: 0 },
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

export namespace ExtractionSessionProvider {
    export type SessionData = {
        sessionId:      string;
        pdfBuffer:      Buffer;
        mdContent:      string;
        fieldPayloads:  Record<string, any>[];  // Payloads enviados ao field extractor
        itemPayloads:   Record<string, any>[];  // Payloads enviados ao item extractor
        rawFields:      any;                     // Resposta bruta da IA (campos)
        rawItems:       any[];                   // Resposta bruta da IA (itens)
        extraction:     unknown;                 // Resultado final mapeado
        metrics:        object;                  // Métricas de performance
        searchQueries:  {                        // Queries usadas na busca vetorial
            field: string[];
            item: string[];
        };
        qdrantConfig:   {                        // Config do Qdrant (reprodutibilidade)
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
        sessionId:          string;
        timestamp:          string;
        pdfUrl:             string;
        numero:             string | null;
        modalidade:         string | null;
        objeto_resumido:    string | null;
        orgao_nome:         string | null;
        total_itens:        number;
        fieldPayloadsCount: number;
        itemPayloadsCount:  number;
        totalTimeMs:        number;
        tokensUsed:         { prompt: number; completion: number; total: number };
    };
}

