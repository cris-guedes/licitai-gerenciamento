import crypto from "crypto";
import type { ProcessPdfResponse } from "@/server/shared/lib/document-handler";
import type { EmbedInput, ChunkMetadata } from "@/server/modules/core-api/domain/data/IEmbeddingProvider";

export type IndexEntry = {
    id:         string;
    embedInput: EmbedInput;
    text:       string;
    metadata:   Record<string, unknown>;
};

export function normalizeEntries(doc: ProcessPdfResponse): IndexEntry[] {
    const sections = normalizeSections(doc.sections ?? []);
    const tables   = normalizeTables(doc.tables ?? []);
    return [...sections, ...tables].map((e, i) => ({
        ...e,
        metadata: { ...e.metadata, chunk_index: i },
    }));
}

function normalizeSections(sections: ProcessPdfResponse["sections"]): IndexEntry[] {
    let currentH1 = "";

    return sections.flatMap(section => {
        if (section.level === 1) {
            currentH1 = section.header;
        }

        return section.chunks
            .filter(chunk => chunk.text.trim())
            .map(chunk => ({
                id:         crypto.randomUUID(),
                embedInput: sectionEmbedInput(section, chunk),
                text:       chunk.text,
                metadata: {
                    type:         "text",
                    original_id:  `chunk-${section.page_start}-${chunk.order}`,
                    section:      currentH1 || section.header,
                    header:       chunk.header || section.header,
                    page:         section.page_start,
                    order:        chunk.order,
                    ast_metadata: chunk.metadata,
                },
            }));
    });
}

function normalizeTables(tables: ProcessPdfResponse["tables"]): IndexEntry[] {
    return tables.flatMap(table =>
        table.chunks.map(row => ({
            id:         crypto.randomUUID(),
            embedInput: { type: "table_row", title: `Tabela Pág ${table.page}`, tags: table.headers, content: JSON.stringify(row.data) },
            text:       JSON.stringify(row.data),
            metadata: {
                type:        "table_row",
                original_id: `tab-${table.page}-${table.index}-${row.row_index}`,
                page:        table.page,
                table_index: table.index,
                row_index:   row.row_index,
                headers:     table.headers,
                markdown:    table.markdown,
            },
        })),
    );
}

function sectionEmbedInput(
    section: ProcessPdfResponse["sections"][number],
    chunk:   ProcessPdfResponse["sections"][number]["chunks"][number],
): ChunkMetadata {
    const title = chunk.header && chunk.header !== section.header
        ? `# ${section.header}\n## ${chunk.header}`
        : `# ${section.header}`;

    const tags = [
        ...chunk.metadata.bold.fragments,
        ...chunk.metadata.italic.fragments,
        ...chunk.metadata.code.fragments,
        section.header,
    ];

    return { type: "text", title, tags, content: chunk.text };
}
