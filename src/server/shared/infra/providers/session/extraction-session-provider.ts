import fs from "fs/promises";
import path from "path";
import type { ProcessedChunk } from "@/server/modules/core-api/domain/data/ProcessedChunk";

const TEMP_BASE_DIR = path.join(process.cwd(), "temp");
const DATASET_FILE = path.join(TEMP_BASE_DIR, "dataset.json");

export class ExtractionSessionProvider {
    private static readonly FILES = {
        originalPdf: "original.pdf",
        pdfProcessingResponse: "pdf-processing-response.json",
        aiInputs: "ai-inputs.json",
        extractionResult: "extraction.json",
        metrics: "metrics.json",
    } as const;

    newSessionId(): string {
        return crypto.randomUUID();
    }

    tempDirFor(sessionId: string): string {
        return path.join(TEMP_BASE_DIR, sessionId);
    }

    artifactPathsFor(sessionId: string): ExtractionSessionProvider.ArtifactPaths {
        const tempDir = this.tempDirFor(sessionId);
        return {
            directory: tempDir,
            originalPdf: path.join(tempDir, ExtractionSessionProvider.FILES.originalPdf),
            pdfProcessingResponse: path.join(tempDir, ExtractionSessionProvider.FILES.pdfProcessingResponse),
            aiInputs: path.join(tempDir, ExtractionSessionProvider.FILES.aiInputs),
            extractionResult: path.join(tempDir, ExtractionSessionProvider.FILES.extractionResult),
            metrics: path.join(tempDir, ExtractionSessionProvider.FILES.metrics),
        };
    }

    async saveArtifacts(data: ExtractionSessionProvider.ArtifactsData): Promise<void> {
        const tempDir = this.tempDirFor(data.sessionId);
        await fs.mkdir(tempDir, { recursive: true });

        const json = (obj: any) => JSON.stringify(obj, null, 2);

        await Promise.all([
            fs.writeFile(path.join(tempDir, ExtractionSessionProvider.FILES.originalPdf), data.pdfBuffer),
            fs.writeFile(path.join(tempDir, ExtractionSessionProvider.FILES.pdfProcessingResponse), json({
                textChunks: formatParsedEntries(data.parsedTextEntries),
                tableChunks: formatParsedEntries(data.parsedTableEntries),
            }), "utf8"),
            fs.writeFile(path.join(tempDir, ExtractionSessionProvider.FILES.aiInputs), json({
                campos: data.fieldPayloads,
                itens: data.itemPayloads,
            }), "utf8"),
            fs.writeFile(path.join(tempDir, ExtractionSessionProvider.FILES.extractionResult), json(data.extraction), "utf8"),
        ]);

        console.log(`[Audit Trail] Artefatos da sessão ${data.sessionId} salvos em ${tempDir}`);
    }

    async saveMetrics(data: ExtractionSessionProvider.MetricsData): Promise<void> {
        const tempDir = this.tempDirFor(data.sessionId);
        await fs.mkdir(tempDir, { recursive: true });

        await Promise.all([
            fs.writeFile(path.join(tempDir, ExtractionSessionProvider.FILES.metrics), JSON.stringify(data.metrics, null, 2), "utf8"),
            this.appendToDataset(data),
        ]);

        console.log(`[Audit Trail] Métricas da sessão ${data.sessionId} salvas em ${tempDir}`);
    }

    private async appendToDataset(data: ExtractionSessionProvider.MetricsData): Promise<void> {
        const metrics = data.metrics as any;
        const extraction = data.extraction as any;
        const edital = extraction?.edital ?? extraction ?? {};
        const orgao = edital.orgao_gerenciador ?? {};
        const itens: any[] = data.rawItems ?? [];

        const entry: ExtractionSessionProvider.DatasetEntry = {
            sessionId: data.sessionId,
            timestamp: metrics.timestamp ?? new Date().toISOString(),
            pdfFilename: metrics.pdfFilename ?? "",
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

export namespace ExtractionSessionProvider {
    export type ArtifactPaths = {
        directory: string;
        originalPdf: string;
        pdfProcessingResponse: string;
        aiInputs: string;
        extractionResult: string;
        metrics: string;
    };

    export type SharedSessionData = {
        sessionId: string;
        fieldPayloads: Record<string, any>[];
        itemPayloads: Record<string, any>[];
        rawItems: any[];
        extraction: unknown;
    };

    export type ArtifactsData = SharedSessionData & {
        pdfBuffer: Buffer;
        parsedTextEntries: ProcessedChunk[];
        parsedTableEntries: ProcessedChunk[];
    };

    export type MetricsData = SharedSessionData & {
        metrics: object;
    };

    export type DatasetEntry = {
        sessionId: string;
        timestamp: string;
        pdfFilename: string;
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

