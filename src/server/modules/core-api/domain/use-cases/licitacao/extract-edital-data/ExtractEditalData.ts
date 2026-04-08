import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { FileParsingProvider } from "@/server/shared/infra/providers/file-parsing/file-parsing-provider";
import { EditalExtractionProvider } from "@/server/shared/infra/providers/ai/edital-extraction/edital-extraction-provider";
import type { ExtractEditalDataControllerSchemas } from "./ExtractEditalDataControllerSchemas";

export class ExtractEditalData {
    constructor(
        private readonly fileParser:   FileParsingProvider,
        private readonly aiExtractor:  EditalExtractionProvider,
    ) {}

    async execute(params: ExtractEditalData.Params): Promise<ExtractEditalData.Response> {
        const { pdfUrl } = params;
        const sessionId  = crypto.randomUUID();
        const startTime  = Date.now();

        console.log(`[ExtractEditalData] ===== INÍCIO DA SESSÃO ${sessionId} =====`);
        console.log(`[ExtractEditalData] PDF URL: ${pdfUrl}`);

        // ── 1. Download do PDF ────────────────────────────────────────────────────
        console.log(`[ExtractEditalData] [1/5] Baixando PDF ...`);
        const downloadStart = Date.now();
        const pdfRes = await fetch(pdfUrl);
        if (!pdfRes.ok) throw new Error(`Falha ao baixar PDF: HTTP ${pdfRes.status} — ${pdfUrl}`);
        const pdfBuffer        = Buffer.from(await pdfRes.arrayBuffer());
        const downloadTimeMs   = Date.now() - downloadStart;
        const pdfFileSizeBytes = pdfBuffer.byteLength;
        console.log(`[ExtractEditalData] [1/5] Download OK em ${downloadTimeMs}ms — ${(pdfFileSizeBytes / 1024).toFixed(1)} KB`);

        // ── 2. Docling: PDF → Markdown ────────────────────────────────────────────
        console.log(`[ExtractEditalData] [2/5] Convertendo PDF → Markdown via Docling ...`);
        const { mdContent, filename: doclingFilename, processingTimeMs: conversionTimeMs } =
            await this.fileParser.convertUrlToMarkdown({ pdfUrl });
        const mdFileSizeBytes = Buffer.byteLength(mdContent, "utf8");
        const mdWordCount     = mdContent.split(/\s+/).filter(Boolean).length;
        console.log(`[ExtractEditalData] [2/5] Docling OK em ${conversionTimeMs}ms — ${mdWordCount} palavras — ${(mdFileSizeBytes / 1024).toFixed(1)} KB`);

        // ── 3. OpenAI: Markdown → AnaliseCriticaEdital ────────────────────────────
        console.log(`[ExtractEditalData] [3/5] Extraindo dados estruturados via OpenAI ...`);
        const { analiseCritica, extractionTimeMs, tokensUsed } =
            await this.aiExtractor.extractAnaliseCritica({ mdContent });
        console.log(`[ExtractEditalData] [3/5] OpenAI OK em ${extractionTimeMs}ms — tokens: ${tokensUsed.total} — itens extraídos: ${analiseCritica.itens?.length ?? 0}`);

        // ── 4. Salvar arquivos na pasta temp ──────────────────────────────────────
        console.log(`[ExtractEditalData] [4/5] Salvando arquivos em temp/${sessionId}/ ...`);
        const tempDir = path.join(process.cwd(), "temp", sessionId);
        await fs.mkdir(tempDir, { recursive: true });

        const totalTimeMs = Date.now() - startTime;
        const timestamp   = new Date().toISOString();

        const metrics: ExtractEditalDataControllerSchemas.Metrics = {
            sessionId,
            timestamp,
            pdfUrl,
            pdfFileSizeBytes,
            conversionTimeMs,
            extractionTimeMs,
            totalTimeMs,
            mdFileSizeBytes,
            mdWordCount,
            doclingFilename,
            tempDir,
            tokensUsed,
        };

        await Promise.all([
            fs.writeFile(path.join(tempDir, "original.pdf"),       pdfBuffer),
            fs.writeFile(path.join(tempDir, "content.md"),         mdContent, "utf8"),
            fs.writeFile(path.join(tempDir, "analise-critica.json"), JSON.stringify(analiseCritica, null, 2), "utf8"),
            fs.writeFile(path.join(tempDir, "metrics.json"),       JSON.stringify(metrics, null, 2), "utf8"),
        ]);

        console.log(`[ExtractEditalData] [4/5] Arquivos salvos:`);
        console.log(`[ExtractEditalData]   → original.pdf        : ${(pdfFileSizeBytes / 1024).toFixed(1)} KB`);
        console.log(`[ExtractEditalData]   → content.md          : ${(mdFileSizeBytes / 1024).toFixed(1)} KB — ${mdWordCount} palavras`);
        console.log(`[ExtractEditalData]   → analise-critica.json: ${analiseCritica.itens?.length ?? 0} itens`);
        console.log(`[ExtractEditalData]   → metrics.json        : ✓`);

        // ── 5. Log de métricas finais ─────────────────────────────────────────────
        console.log(`[ExtractEditalData] [5/5] MÉTRICAS FINAIS:`);
        console.log(`[ExtractEditalData]   sessionId        : ${sessionId}`);
        console.log(`[ExtractEditalData]   downloadTimeMs   : ${downloadTimeMs}ms`);
        console.log(`[ExtractEditalData]   conversionTimeMs : ${conversionTimeMs}ms`);
        console.log(`[ExtractEditalData]   extractionTimeMs : ${extractionTimeMs}ms`);
        console.log(`[ExtractEditalData]   totalTimeMs      : ${totalTimeMs}ms`);
        console.log(`[ExtractEditalData]   tokens total     : ${tokensUsed.total}`);
        console.log(`[ExtractEditalData] ===== FIM DA SESSÃO ${sessionId} =====`);

        return { sessionId, mdContent, analiseCritica, metrics };
    }
}

export namespace ExtractEditalData {
    export type Params   = ExtractEditalDataControllerSchemas.Input;
    export type Response = ExtractEditalDataControllerSchemas.Output;
}
