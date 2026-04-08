import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { FileParsingProvider } from "@/server/shared/infra/providers/file-parsing/file-parsing-provider";
import type { ExtractEditalDataControllerSchemas } from "./ExtractEditalDataControllerSchemas";

export class ExtractEditalData {
    constructor(private readonly fileParser: FileParsingProvider) {}

    async execute(params: ExtractEditalData.Params): Promise<ExtractEditalData.Response> {
        const { pdfUrl } = params;
        const sessionId  = crypto.randomUUID();
        const startTime  = Date.now();

        console.log(`[ExtractEditalData] ===== INÍCIO DA SESSÃO ${sessionId} =====`);
        console.log(`[ExtractEditalData] PDF URL: ${pdfUrl}`);

        // ── 1. Download do PDF para salvar localmente e obter tamanho ───────────
        console.log(`[ExtractEditalData] [1/4] Baixando PDF de ${pdfUrl} ...`);
        const downloadStart = Date.now();
        const pdfRes = await fetch(pdfUrl);
        if (!pdfRes.ok) {
            throw new Error(`Falha ao baixar PDF: HTTP ${pdfRes.status} — ${pdfUrl}`);
        }
        const pdfBuffer        = Buffer.from(await pdfRes.arrayBuffer());
        const downloadTimeMs   = Date.now() - downloadStart;
        const pdfFileSizeBytes = pdfBuffer.byteLength;
        console.log(`[ExtractEditalData] [1/4] Download concluído em ${downloadTimeMs}ms — tamanho: ${pdfFileSizeBytes} bytes (${(pdfFileSizeBytes / 1024).toFixed(1)} KB)`);

        // ── 2. Converter PDF → Markdown via Docling ──────────────────────────────
        console.log(`[ExtractEditalData] [2/4] Enviando para Docling converter para Markdown ...`);
        const { mdContent, filename: doclingFilename, processingTimeMs } =
            await this.fileParser.convertUrlToMarkdown({ pdfUrl });
        console.log(`[ExtractEditalData] [2/4] Docling concluiu em ${processingTimeMs}ms — ${mdContent.length} chars de Markdown`);

        // ── 3. Salvar arquivos na pasta temp ─────────────────────────────────────
        console.log(`[ExtractEditalData] [3/4] Salvando arquivos na pasta temp ...`);
        const tempDir = path.join(process.cwd(), "temp", sessionId);
        await fs.mkdir(tempDir, { recursive: true });

        const pdfPath     = path.join(tempDir, "original.pdf");
        const mdPath      = path.join(tempDir, "content.md");
        const metricsPath = path.join(tempDir, "metrics.json");

        const totalTimeMs      = Date.now() - startTime;
        const mdFileSizeBytes  = Buffer.byteLength(mdContent, "utf8");
        const mdWordCount      = mdContent.split(/\s+/).filter(Boolean).length;
        const timestamp        = new Date().toISOString();

        const metrics: ExtractEditalDataControllerSchemas.Metrics = {
            sessionId,
            timestamp,
            pdfUrl,
            pdfFileSizeBytes,
            conversionTimeMs: processingTimeMs,
            totalTimeMs,
            mdFileSizeBytes,
            mdWordCount,
            doclingFilename,
            tempDir,
        };

        await Promise.all([
            fs.writeFile(pdfPath, pdfBuffer),
            fs.writeFile(mdPath, mdContent, "utf8"),
            fs.writeFile(metricsPath, JSON.stringify(metrics, null, 2), "utf8"),
        ]);

        console.log(`[ExtractEditalData] [3/4] Arquivos salvos em: ${tempDir}`);
        console.log(`[ExtractEditalData]   → original.pdf  : ${pdfFileSizeBytes} bytes`);
        console.log(`[ExtractEditalData]   → content.md    : ${mdFileSizeBytes} bytes — ${mdWordCount} palavras`);
        console.log(`[ExtractEditalData]   → metrics.json  : ✓`);

        // ── 4. Log de métricas finais ─────────────────────────────────────────────
        console.log(`[ExtractEditalData] [4/4] MÉTRICAS FINAIS:`);
        console.log(`[ExtractEditalData]   sessionId        : ${sessionId}`);
        console.log(`[ExtractEditalData]   pdfFileSizeBytes : ${pdfFileSizeBytes} (${(pdfFileSizeBytes / 1024).toFixed(1)} KB)`);
        console.log(`[ExtractEditalData]   downloadTimeMs   : ${downloadTimeMs}ms`);
        console.log(`[ExtractEditalData]   conversionTimeMs : ${processingTimeMs}ms`);
        console.log(`[ExtractEditalData]   totalTimeMs      : ${totalTimeMs}ms`);
        console.log(`[ExtractEditalData]   mdWordCount      : ${mdWordCount}`);
        console.log(`[ExtractEditalData] ===== FIM DA SESSÃO ${sessionId} =====`);

        return { sessionId, mdContent, metrics };
    }
}

export namespace ExtractEditalData {
    export type Params   = ExtractEditalDataControllerSchemas.Input;
    export type Response = ExtractEditalDataControllerSchemas.Output;
}
