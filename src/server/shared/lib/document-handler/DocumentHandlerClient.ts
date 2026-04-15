// ─── Schemas (espelham o swagger em api.document-handler.json) ───────────────

/** Parágrafo de texto de uma página — unidade para embedding */
export interface TextChunkSchema {
    /** Ordem do parágrafo dentro da página */
    order: number;
    /** Texto do parágrafo */
    text:  string;
}

/** Linha de uma tabela — unidade para embedding */
export interface TableChunkSchema {
    /** Índice da linha na tabela (0-based) */
    row_index: number;
    /** Par índice_coluna→valor (chave = "0", "1", "2"...) */
    data: Record<string, string>;
}

/** Página extraída com seus parágrafos */
export interface PageSchema {
    /** Número da página (1-based) */
    page:   number;
    /** Total de caracteres na página */
    chars:  number;
    /** Total de palavras na página */
    words:  number;
    /** Parágrafos da página prontos para embedding */
    chunks: TextChunkSchema[];
}

/** Tabela extraída com markdown completo e linhas para embedding */
export interface TableSchema {
    /** Página onde a tabela foi encontrada */
    page:     number;
    /** Índice da tabela dentro da página (0-based) */
    index:    number;
    /** Tabela completa em markdown */
    markdown: string;
    /** Número de linhas */
    rows:     number;
    /** Número de colunas */
    cols:     number;
    /** Cabeçalhos da tabela */
    headers:  string[];
    /** Linhas da tabela prontas para embedding */
    chunks:   TableChunkSchema[];
}

export interface ProcessPdfResponse {
    /** Nome do arquivo processado */
    filename:           string;
    /** Timestamp do processamento (ISO 8601) */
    processed_at:       string;
    /** Tempo de processamento em milissegundos */
    processing_time_ms: number;
    /** Tamanho do arquivo em bytes */
    file_size_bytes:    number;
    /** Total de páginas do PDF */
    total_pages:        number;
    /** Páginas com texto extraído */
    pages_with_text:    number;
    /** Páginas sem texto */
    pages_empty:        number;
    /** Total de caracteres extraídos */
    total_chars:        number;
    /** Total de palavras extraídas */
    total_words:        number;
    /** Total de tabelas extraídas */
    total_tables:       number;
    /** Páginas com seus chunks de texto */
    pages:  PageSchema[];
    /** Tabelas com seus chunks de linha */
    tables: TableSchema[];
}

export interface ValidationError {
    loc:    (string | number)[];
    msg:    string;
    type:   string;
    input?: unknown;
    ctx?:   Record<string, unknown>;
}

export interface HTTPValidationError {
    detail?: ValidationError[];
}

// ─── Erro ────────────────────────────────────────────────────────────────────

export class DocumentHandlerApiError extends Error {
    constructor(
        public readonly status: number,
        public readonly body: string,
    ) {
        super(`DocumentHandler API error ${status}: ${body}`);
        this.name = "DocumentHandlerApiError";
    }
}

// ─── Client ──────────────────────────────────────────────────────────────────

const DEFAULT_BASE_URL = process.env.DOCUMENT_HANDLER_API_URL ?? "http://localhost:8000";

export class DocumentHandlerClient {
    private readonly base: string;

    constructor(baseUrl: string = DEFAULT_BASE_URL) {
        // Remove barra final para evitar double-slash (ex: "host//process-pdf")
        this.base = baseUrl.replace(/\/+$/, "");
    }

    /**
     * POST /process-pdf — envia o arquivo PDF como multipart/form-data.
     * Retorna parágrafos por página e tabelas em markdown + chunks de linha.
     */
    async processPdf(file: Buffer, filename = "document.pdf"): Promise<ProcessPdfResponse> {
        const formData    = new FormData();
        // slice() garante ArrayBuffer próprio — evita SharedArrayBuffer em BlobPart
        const arrayBuffer = file.buffer.slice(
            file.byteOffset,
            file.byteOffset + file.byteLength,
        ) as ArrayBuffer;
        formData.append("file", new Blob([arrayBuffer], { type: "application/pdf" }), filename);

        const response = await fetch(`${this.base}/process-pdf`, {
            method: "POST",
            body:   formData,
        });

        if (!response.ok) {
            const errorBody = await response.text().catch(() => "(sem body)");
            throw new DocumentHandlerApiError(response.status, errorBody);
        }

        return response.json() as Promise<ProcessPdfResponse>;
    }
}
