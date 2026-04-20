import { DocumentHandlerFileParsingProvider } from "@/server/shared/infra/providers/pdf/document-handler-file-parsing-provider";
import { OpenAIEmbeddingProvider } from "@/server/shared/infra/providers/ia/embeding/providers/openai-embedding-provider";
import { QdrantVectorStore } from "@/server/shared/infra/providers/ia/vector/qdrant-vector-store";
import { EditalFieldExtractorAgent } from "@/server/shared/infra/providers/ia/agents/edital-field-extractor";
import { EditalItemExtractorAgent } from "@/server/shared/infra/providers/ia/agents/edital-item-extractor";
import { MetricsProvider } from "@/server/shared/infra/providers/metrics/metrics-provider";
import { ExtractionSessionProvider } from "@/server/shared/infra/providers/session/extraction-session-provider";
import { ExtractEditalData } from "./ExtractEditalData";
import { ExtractEditalDataStreamController } from "./ExtractEditalDataStreamController";
import { ExtractEditalDataController } from "./ExtractEditalDataController";

const CONFIG = {
    embedding: {
        model: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
        dimensions: 1536,
        batchSize: 256,
        maxConcurrency: 5,
    },
    vectorStore: {
        COLLECTION_NAME: process.env.QDRANT_COLLECTION ?? "edital-v1-1536",
        FIELD_SEARCH_LIMIT: 10,
        FIELD_SCORE_THRESHOLD: 0.50,
        ITEM_SEARCH_LIMIT: 40,
        ITEM_SCORE_THRESHOLD: 0.50,
        ITEM_TYPE_FILTER: ["table_md", "table_row"],
    }
};

function createUseCase() {
    const embeddingProvider = new OpenAIEmbeddingProvider({
        model: CONFIG.embedding.model,
        dimensions: CONFIG.embedding.dimensions,
        batchSize: CONFIG.embedding.batchSize,
        maxConcurrency: CONFIG.embedding.maxConcurrency,
    });

    return new ExtractEditalData(
        new DocumentHandlerFileParsingProvider(),
        embeddingProvider,
        new QdrantVectorStore(),
        new EditalFieldExtractorAgent(),
        new EditalItemExtractorAgent(),
        new MetricsProvider(),
        new ExtractionSessionProvider(),
        CONFIG.vectorStore
    );
}

export function makeExtractEditalData(): ExtractEditalDataController {
    return new ExtractEditalDataController(createUseCase());
}

export function makeExtractEditalDataStream(): ExtractEditalDataStreamController {
    return new ExtractEditalDataStreamController(createUseCase());
}
