import fs from "fs/promises";
import path from "path";
// scoredChunks are optional in simplified flow
import type { ChunkedDocumentResultItem } from "@/server/shared/lib/docling/models/ChunkedDocumentResultItem";

const TEMP_BASE_DIR  = path.join(process.cwd(), "temp");
const DATASET_FILE   = path.join(TEMP_BASE_DIR, "dataset.json");

export class ExtractionSessionProvider {
    tempDirFor(sessionId: string): string {
        return path.join(TEMP_BASE_DIR, sessionId);
    }

    async save(data: ExtractionSessionProvider.SessionData): Promise<void> {
        const tempDir = this.tempDirFor(data.sessionId);
        await fs.mkdir(tempDir, { recursive: true });
        const scoredSummary = data.topChunks ?? [];
        await Promise.all([
            fs.writeFile(path.join(tempDir, "original.pdf"),       data.pdfBuffer),
            fs.writeFile(path.join(tempDir, "content.md"),         data.mdContent,                          "utf8"),
            fs.writeFile(path.join(tempDir, "filtered.md"),        data.filteredMd,                         "utf8"),
            fs.writeFile(path.join(tempDir, "chunks.json"),        JSON.stringify(data.chunks, null, 2),     "utf8"),
            fs.writeFile(path.join(tempDir, "scored-chunks.json"), JSON.stringify(scoredSummary, null, 2),   "utf8"),
            fs.writeFile(path.join(tempDir, "extraction.json"),    JSON.stringify(data.extraction, null, 2), "utf8"),
            fs.writeFile(path.join(tempDir, "metrics.json"),       JSON.stringify(data.metrics, null, 2),    "utf8"),
            this.appendToDataset(data),
        ]);
    }

    private async appendToDataset(data: ExtractionSessionProvider.SessionData): Promise<void> {
        const metrics    = data.metrics as any;
        const edital     = (data.extraction as any)?.edital ?? {};
        const orgao      = edital.orgao_gerenciador ?? {};
        const datas      = edital.datas ?? {};
        const itens: any[] = edital.itens ?? [];

        const entry: ExtractionSessionProvider.DatasetEntry = {
            sessionId:           data.sessionId,
            timestamp:           metrics.timestamp ?? new Date().toISOString(),
            pdfUrl:              metrics.pdfUrl ?? "",
            // identificação do edital
            numero:              edital.numero              ?? null,
            numero_processo:     edital.numero_processo     ?? null,
            modalidade:          edital.modalidade          ?? null,
            objeto_resumido:     edital.objeto_resumido     ?? null,
            valor_estimado_total: edital.valor_estimado_total ?? null,
            // órgão
            orgao: {
                nome:   orgao.nome   ?? null,
                cnpj:   orgao.cnpj   ?? null,
                uf:     orgao.uf     ?? null,
                cidade: orgao.cidade ?? null,
            },
            // datas chave
            data_abertura:        datas.data_abertura        ?? null,
            data_proposta_limite: datas.data_proposta_limite  ?? null,
            // resumo dos itens
            total_itens:         itens.length,
            itens_resumo:        itens.slice(0, 5).map((it: any) => ({
                numero:      it.numero,
                descricao:   it.descricao,
                quantidade:  it.quantidade,
                unidade:     it.unidade,
                valor_total: it.valor_total_estimado ?? null,
            })),
            // métricas de processamento
            metricas: {
                pdfFileSizeBytes: metrics.pdfFileSizeBytes ?? 0,
                mdWordCount:      metrics.mdWordCount      ?? 0,
                chunkCount:       metrics.chunkCount       ?? 0,
                totalTimeMs:      metrics.totalTimeMs      ?? 0,
                conversionTimeMs: metrics.conversionTimeMs ?? 0,
                chunkingTimeMs:   metrics.chunkingTimeMs   ?? 0,
                extractionTimeMs: metrics.extractionTimeMs ?? 0,
                tokensUsed:       metrics.tokensUsed       ?? { prompt: 0, completion: 0, total: 0 },
            },
            // configuração usada — essencial para comparar resultados entre runs
            config: metrics.config ?? null,
        };

        let dataset: ExtractionSessionProvider.DatasetEntry[] = [];
        try {
            const raw = await fs.readFile(DATASET_FILE, "utf8");
            dataset = JSON.parse(raw);
        } catch {
            // arquivo ainda não existe — começa vazio
        }

        // substitui entrada existente com mesmo sessionId ou adiciona nova
        const idx = dataset.findIndex(e => e.sessionId === entry.sessionId);
        if (idx >= 0) dataset[idx] = entry;
        else dataset.push(entry);

        await fs.mkdir(TEMP_BASE_DIR, { recursive: true });
        await fs.writeFile(DATASET_FILE, JSON.stringify(dataset, null, 2), "utf8");
        console.log(`[ExtractionSessionProvider] Dataset atualizado — ${dataset.length} entradas → ${DATASET_FILE}`);
    }
}

export namespace ExtractionSessionProvider {
    export type SessionData = {
        sessionId:    string;
        pdfBuffer:    Buffer;
        mdContent:    string;
        filteredMd:   string;
        chunks:       ChunkedDocumentResultItem[];
        topChunks?:   any[];
        extraction:   unknown;
        metrics:      object;
    };

    export type DatasetEntry = {
        sessionId:            string;
        timestamp:            string;
        pdfUrl:               string;
        numero:               string | null;
        numero_processo:      string | null;
        modalidade:           string | null;
        objeto_resumido:      string | null;
        valor_estimado_total: number | null;
        orgao: {
            nome:   string | null;
            cnpj:   string | null;
            uf:     string | null;
            cidade: string | null;
        };
        data_abertura:        string | null;
        data_proposta_limite: string | null;
        total_itens:          number;
        itens_resumo: Array<{
            numero:      number;
            descricao:   string;
            quantidade:  number;
            unidade:     string;
            valor_total: number | null;
        }>;
        metricas: {
            pdfFileSizeBytes: number;
            mdWordCount:      number;
            chunkCount:       number;
            totalTimeMs:      number;
            conversionTimeMs: number;
            chunkingTimeMs:   number;
            extractionTimeMs: number;
            tokensUsed:       { prompt: number; completion: number; total: number };
        };
        config: {
            chunkSize:        number;
            chunkOverlap:     number;
            embeddingModel:   string;
            aiModel:          string;
            fileParser:       string;
            extractionMode:   string;
            topKPorIntent:    Record<string, number>;
            queriesPorIntent: Record<string, string[]>;
        } | null;
    };
}
