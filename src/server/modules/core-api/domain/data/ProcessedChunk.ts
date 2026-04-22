import type { EmbedInput } from "@/server/modules/core-api/domain/data/IEmbeddingProvider";

export type ProcessedChunk = {
    id:         string;
    embedInput: EmbedInput;
    content:    string;
    raw:        string;
    metadata: {
        type:        "text" | "table_row";
        page:        number;
        origin:      string;
        word_count:  number;
        chunk_index: number;
        id?:         string;
        [key: string]: any;
    };
};
