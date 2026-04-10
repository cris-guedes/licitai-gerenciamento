import { PdfReader } from "pdfreader";

/**
 * Provider de parsing de PDF usando pdfreader (pure JS, sem serviços externos).
 * Detecta tabelas via análise de posicionamento X/Y dos itens de texto,
 * reconstruindo-as como markdown tables — crítico para editais com listas de itens.
 *
 * Estratégia de detecção de tabela:
 * 1. Agrupa palavras adjacentes em "células" (gap entre item.x+item.w e próximo item.x < threshold)
 * 2. Só marca uma linha como candidata a tabela se tiver ≥ MIN_CELLS_PER_ROW células
 * 3. Confirma tabela quando ≥ MIN_TABLE_ROWS consecutivas são candidatas E têm colunas alinhadas
 */
export class PdfReaderFileParsingProvider {
    async convertPdfToMarkdown({
        pdfBuffer,
    }: PdfReaderFileParsingProvider.ConvertPdfToMarkdownParams): Promise<PdfReaderFileParsingProvider.ConvertPdfToMarkdownResponse> {
        const t0 = Date.now();
        console.log(`[PdfReaderFileParsingProvider] Iniciando — bytes: ${pdfBuffer.byteLength}`);

        const pages        = await PdfReaderFileParsingProvider.parsePdfToPages(pdfBuffer);
        const mdContent    = PdfReaderFileParsingProvider.pagesToMarkdown(pages);

        const conversionTimeMs = Date.now() - t0;
        const mdFileSizeBytes  = Buffer.byteLength(mdContent, "utf8");
        const mdWordCount      = mdContent.split(/\s+/).filter(Boolean).length;

        console.log(`[PdfReaderFileParsingProvider] Concluído em ${conversionTimeMs}ms — chars: ${mdContent.length}`);

        return { mdContent, doclingFilename: "document.md", conversionTimeMs, mdFileSizeBytes, mdWordCount };
    }

    // ─── Thresholds ───────────────────────────────────────────────────────────────

    /** Gap máximo (unidades pdfreader) entre item.x+item.w e próximo item.x para serem mesclados numa célula */
    private static readonly INTRA_CELL_GAP   = 1.2;
    /** Gap mínimo entre células para considerar que são colunas distintas */
    private static readonly INTER_CELL_GAP   = 2.5;
    /** Número mínimo de células por linha para ser candidata a tabela */
    private static readonly MIN_CELLS        = 3;
    /** Número mínimo de linhas consecutivas para confirmar uma tabela */
    private static readonly MIN_TABLE_ROWS   = 4;
    /** Fração mínima de linhas que precisam ter célula em cada banda de coluna */
    private static readonly COL_COVERAGE     = 0.6;
    /** Tolerância de alinhamento de coluna entre linhas */
    private static readonly COL_ALIGN_TOL    = 1.8;
    /** Threshold de Y para agrupar itens na mesma linha */
    private static readonly ROW_Y_THRESHOLD  = 0.45;

    // ─── Parsing ─────────────────────────────────────────────────────────────────

    private static parsePdfToPages(buffer: Buffer): Promise<PdfReaderFileParsingProvider.PageData[]> {
        return new Promise((resolve, reject) => {
            const pages: PdfReaderFileParsingProvider.PageData[] = [];
            let currentPage: PdfReaderFileParsingProvider.TextItem[] = [];

            new PdfReader().parseBuffer(buffer, (err: any, item: any) => {
                if (err) { reject(new Error(`[PdfReaderFileParsingProvider] Erro: ${err}`)); return; }

                if (!item) {
                    if (currentPage.length > 0) pages.push({ items: currentPage });
                    resolve(pages);
                    return;
                }

                if (item.page) {
                    if (currentPage.length > 0) pages.push({ items: currentPage });
                    currentPage = [];
                    return;
                }

                if (item.text !== undefined && item.text.trim() !== "") {
                    currentPage.push({ text: item.text, x: item.x ?? 0, y: item.y ?? 0, w: item.w ?? 0 });
                }
            });
        });
    }

    // ─── Conversão de páginas para markdown ──────────────────────────────────────

    private static pagesToMarkdown(pages: PdfReaderFileParsingProvider.PageData[]): string {
        return pages
            .map(page => PdfReaderFileParsingProvider.pageToMarkdown(page.items))
            .join("\n\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }

    private static pageToMarkdown(items: PdfReaderFileParsingProvider.TextItem[]): string {
        if (items.length === 0) return "";
        const rows   = PdfReaderFileParsingProvider.groupIntoRows(items);
        const blocks = PdfReaderFileParsingProvider.detectBlocks(rows);
        return blocks.map(b => PdfReaderFileParsingProvider.blockToMarkdown(b)).filter(Boolean).join("\n\n");
    }

    // ─── Agrupamento em linhas ────────────────────────────────────────────────────

    private static groupIntoRows(items: PdfReaderFileParsingProvider.TextItem[]): PdfReaderFileParsingProvider.Row[] {
        const sorted = [...items].sort((a, b) => a.y - b.y || a.x - b.x);
        const rows: PdfReaderFileParsingProvider.Row[] = [];

        for (const item of sorted) {
            const last = rows[rows.length - 1];
            if (last && Math.abs(item.y - last.y) <= this.ROW_Y_THRESHOLD) {
                last.items.push(item);
            } else {
                rows.push({ y: item.y, items: [item] });
            }
        }

        for (const row of rows) row.items.sort((a, b) => a.x - b.x);
        return rows;
    }

    // ─── Mesclagem de palavras em células ────────────────────────────────────────

    /**
     * Agrupa itens de texto adjacentes (sem gap significativo entre eles) em células.
     * Usa item.x + item.w para saber onde termina cada item.
     * Se item.w = 0, estima a largura como comprimento_texto * 0.5 (aproximação conservadora).
     */
    private static mergeToCells(row: PdfReaderFileParsingProvider.Row): PdfReaderFileParsingProvider.Cell[] {
        const items = row.items;
        if (items.length === 0) return [];

        const cells: PdfReaderFileParsingProvider.Cell[] = [];
        let cellItems = [items[0]];

        for (let i = 1; i < items.length; i++) {
            const prev    = cellItems[cellItems.length - 1];
            const prevEnd = prev.x + (prev.w > 0 ? prev.w : prev.text.length * 0.5);
            const gap     = items[i].x - prevEnd;

            if (gap <= this.INTRA_CELL_GAP) {
                cellItems.push(items[i]);
            } else {
                cells.push(PdfReaderFileParsingProvider.buildCell(cellItems));
                cellItems = [items[i]];
            }
        }
        cells.push(PdfReaderFileParsingProvider.buildCell(cellItems));
        return cells;
    }

    private static buildCell(items: PdfReaderFileParsingProvider.TextItem[]): PdfReaderFileParsingProvider.Cell {
        const text = items.map(it => it.text).join(" ").trim();
        const x    = items[0].x;
        const end  = items[items.length - 1];
        const xEnd = end.x + (end.w > 0 ? end.w : end.text.length * 0.5);
        return { text, x, xEnd };
    }

    // ─── Detecção de blocos ───────────────────────────────────────────────────────

    private static detectBlocks(rows: PdfReaderFileParsingProvider.Row[]): PdfReaderFileParsingProvider.Block[] {
        const cellRows = rows.map(r => ({
            row:   r,
            cells: PdfReaderFileParsingProvider.mergeToCells(r),
        }));

        const blocks: PdfReaderFileParsingProvider.Block[] = [];
        let i = 0;

        while (i < cellRows.length) {
            const tableEnd = PdfReaderFileParsingProvider.findTableEnd(cellRows, i);

            if (tableEnd > i + 1) {
                blocks.push({ type: "table", rows: cellRows.slice(i, tableEnd).map(cr => cr.row) });
                i = tableEnd;
            } else {
                const textRows: PdfReaderFileParsingProvider.Row[] = [];
                while (i < cellRows.length && PdfReaderFileParsingProvider.findTableEnd(cellRows, i) <= i + 1) {
                    textRows.push(cellRows[i].row);
                    i++;
                }
                if (textRows.length > 0) blocks.push({ type: "text", rows: textRows });
            }
        }

        return blocks;
    }

    private static findTableEnd(
        cellRows: Array<{ row: PdfReaderFileParsingProvider.Row; cells: PdfReaderFileParsingProvider.Cell[] }>,
        start: number,
    ): number {
        // Precisamos de pelo menos MIN_TABLE_ROWS linhas a partir daqui
        if (start + this.MIN_TABLE_ROWS > cellRows.length) return start + 1;

        // Verificar se as primeiras MIN_TABLE_ROWS são candidatas (têm ≥ MIN_CELLS)
        const sample = cellRows.slice(start, start + this.MIN_TABLE_ROWS);
        if (!sample.every(cr => PdfReaderFileParsingProvider.isTableRowCandidate(cr.cells))) return start + 1;

        // Detectar bandas de coluna nas linhas de amostra
        const colBands = PdfReaderFileParsingProvider.detectColumnBandsFromCells(
            sample.map(cr => cr.cells),
        );
        if (colBands.length < this.MIN_CELLS) return start + 1;

        // Expandir enquanto linhas seguintes continuam como candidatas e se encaixam nas bandas
        let end = start + this.MIN_TABLE_ROWS;
        while (end < cellRows.length) {
            const cr = cellRows[end];
            if (!PdfReaderFileParsingProvider.isTableRowCandidate(cr.cells)) break;
            if (!PdfReaderFileParsingProvider.cellsFitColumns(cr.cells, colBands)) break;
            end++;
        }

        return end;
    }

    /**
     * Uma linha é candidata a tabela se tiver ≥ MIN_CELLS células com gaps ≥ INTER_CELL_GAP entre elas.
     */
    private static isTableRowCandidate(cells: PdfReaderFileParsingProvider.Cell[]): boolean {
        if (cells.length < this.MIN_CELLS) return false;

        // Verificar que os gaps entre células são grandes o suficiente
        let significantGaps = 0;
        for (let i = 1; i < cells.length; i++) {
            const gap = cells[i].x - cells[i - 1].xEnd;
            if (gap >= this.INTER_CELL_GAP) significantGaps++;
        }

        return significantGaps >= this.MIN_CELLS - 1;
    }

    /**
     * Detecta bandas de coluna a partir das posições X iniciais das células,
     * exigindo que cada banda apareça em pelo menos COL_COVERAGE das linhas.
     */
    private static detectColumnBandsFromCells(
        cellMatrix: PdfReaderFileParsingProvider.Cell[][],
    ): Array<[number, number]> {
        // Coletar candidatos: X de cada célula em cada linha
        const allX = cellMatrix.flatMap(cells => cells.map(c => c.x));
        allX.sort((a, b) => a - b);

        // Agrupar X próximos em bandas candidatas
        const rawBands: Array<[number, number]> = [];
        let bStart = allX[0];
        let bEnd   = allX[0];

        for (let i = 1; i < allX.length; i++) {
            if (allX[i] - bEnd <= this.COL_ALIGN_TOL) {
                bEnd = allX[i];
            } else {
                rawBands.push([bStart, bEnd]);
                bStart = allX[i];
                bEnd   = allX[i];
            }
        }
        rawBands.push([bStart, bEnd]);

        // Filtrar: manter apenas bandas presentes em ≥ COL_COVERAGE das linhas
        const totalRows  = cellMatrix.length;
        const threshold  = this.COL_COVERAGE * totalRows;

        return rawBands.filter(([bMin, bMax]) => {
            const count = cellMatrix.filter(cells =>
                cells.some(c => c.x >= bMin - this.COL_ALIGN_TOL && c.x <= bMax + this.COL_ALIGN_TOL)
            ).length;
            return count >= threshold;
        });
    }

    private static cellsFitColumns(
        cells: PdfReaderFileParsingProvider.Cell[],
        bands: Array<[number, number]>,
    ): boolean {
        const matched = bands.filter(([bMin, bMax]) =>
            cells.some(c => c.x >= bMin - this.COL_ALIGN_TOL && c.x <= bMax + this.COL_ALIGN_TOL)
        ).length;
        return matched / bands.length >= this.COL_COVERAGE;
    }

    // ─── Renderização para markdown ───────────────────────────────────────────────

    private static blockToMarkdown(block: PdfReaderFileParsingProvider.Block): string {
        if (block.type === "text") {
            return block.rows
                .map(row => row.items.map(it => it.text).join(" ").trim())
                .filter(Boolean)
                .join("\n");
        }

        // Tabela: descobrir bandas de coluna finais e distribuir células
        const cellMatrix = block.rows.map(r => PdfReaderFileParsingProvider.mergeToCells(r));
        const colBands   = PdfReaderFileParsingProvider.detectColumnBandsFromCells(cellMatrix);

        const tableRows = cellMatrix.map(cells =>
            colBands.map(([bMin, bMax]) => {
                const matching = cells.filter(
                    c => c.x >= bMin - this.COL_ALIGN_TOL && c.x <= bMax + this.COL_ALIGN_TOL,
                );
                return matching.map(c => c.text).join(" ").trim();
            })
        );

        if (tableRows.length === 0) return "";

        const colWidths = colBands.map((_, ci) =>
            Math.max(3, ...tableRows.map(r => (r[ci] ?? "").length))
        );

        const pad       = (s: string, w: number) => s.padEnd(w);
        const renderRow = (cells: string[]) =>
            "| " + cells.map((c, ci) => pad(c, colWidths[ci])).join(" | ") + " |";
        const separator =
            "| " + colWidths.map(w => "-".repeat(w)).join(" | ") + " |";

        const [header, ...body] = tableRows;
        return [renderRow(header!), separator, ...body.map(renderRow)].join("\n");
    }
}

export namespace PdfReaderFileParsingProvider {
    export type ConvertPdfToMarkdownParams = {
        pdfUrl:    string;
        pdfBuffer: Buffer;
        mode?:     string;
    };

    export type ConvertPdfToMarkdownResponse = {
        mdContent:        string;
        doclingFilename:  string;
        conversionTimeMs: number;
        mdFileSizeBytes:  number;
        mdWordCount:      number;
    };

    export type TextItem = { text: string; x: number; y: number; w: number };
    export type Cell     = { text: string; x: number; xEnd: number };
    export type Row      = { y: number; items: TextItem[] };
    export type PageData = { items: TextItem[] };
    export type Block    = { type: "table" | "text"; rows: Row[] };
}
