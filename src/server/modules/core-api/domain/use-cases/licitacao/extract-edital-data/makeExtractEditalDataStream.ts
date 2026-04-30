import { DocumentHandlerFileParsingProvider } from "@/server/shared/infra/providers/pdf/document-handler-file-parsing-provider";
import { OpenAIEmbeddingProvider } from "@/server/shared/infra/providers/ia/embeding/providers/openai-embedding-provider";
import { QdrantVectorStore } from "@/server/shared/infra/providers/ia/vector/qdrant-vector-store";
import { EditalFieldExtractorAgent } from "@/server/shared/infra/providers/ia/agents/edital-field-extractor";
import { EditalItemExtractorAgent } from "@/server/shared/infra/providers/ia/agents/edital-item-extractor";
import { OpenAIModel } from "@/server/shared/infra/providers/ia/models/openai-model";
import { MetricsProvider } from "@/server/shared/infra/providers/metrics/metrics-provider";
import { ExtractionSessionProvider } from "@/server/shared/infra/providers/session/extraction-session-provider";
import { UuidIdentifierProvider } from "@/server/shared/infra/providers/identifier/uuid-identifier-provider";
import { PQueuePromiseProvider } from "@/server/shared/infra/providers/promise/p-queue-promise-provider";
import { PdfIngestionWorker } from "@/server/modules/core-api/workers/pdf-ingestion/PdfIngestionWorker";
import { TableIngestionWorker } from "@/server/modules/core-api/workers/pdf-ingestion/TableIngestionWorker";
import { LLMDocumentPrettifyProvider } from "@/server/shared/infra/providers/ia/prettify/llm-document-prettify-provider";
import { ExtractEditalData } from "./ExtractEditalData";
import { ExtractEditalDataController } from "./ExtractEditalDataController";
import { ExtractEditalDataStreamController } from "./ExtractEditalDataStreamController";
import { ExtractInfoPipeline } from "./pipelines/ExtractInfoPipeline";
import { ExtractItemsPipeline } from "./pipelines/ExtractItemsPipeline";

const CONFIG = {
    llm: {
        fieldModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        itemModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    },
    embedding: {
        model: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
        dimensions: 1536,
        batchSize: 256,
        maxConcurrency: 5,
    },
    vectorStore: {
        COLLECTION_NAME: process.env.QDRANT_COLLECTION ?? "edital-v1-1536",
        FIELD_SEARCH_LIMIT: 200,
        FIELD_SCORE_THRESHOLD: 0.48,
        ITEM_SEARCH_LIMIT: 800,
        ITEM_SCORE_THRESHOLD: 0.30,
        ITEM_SCROLL_BATCH_SIZE: 1000,
        ITEM_SCROLL_SCORE: 1.0,
        ITEM_EXTRACTION_CONCURRENCY: 8,
        EMBEDDING_CONCURRENCY: 5,
        STORE_CONCURRENCY: 5,
    },
};

function createUseCase() {
    const metricsProvider = new MetricsProvider();

    const embeddingProvider = new OpenAIEmbeddingProvider({
        model: CONFIG.embedding.model,
        dimensions: CONFIG.embedding.dimensions,
        batchSize: CONFIG.embedding.batchSize,
        maxConcurrency: CONFIG.embedding.maxConcurrency,
    });

    const vectorStore = new QdrantVectorStore();
    const identifierProvider = new UuidIdentifierProvider();
    const promiseProvider = new PQueuePromiseProvider();
    const documentParser = new DocumentHandlerFileParsingProvider();
    const prettifyProvider = new LLMDocumentPrettifyProvider();
    const fieldModel = new OpenAIModel({ model: CONFIG.llm.fieldModel });
    const itemModel = new OpenAIModel({ model: CONFIG.llm.itemModel });

    // 1. Instancia os Workers
    const pdfIngestionWorker = new PdfIngestionWorker(
        documentParser,
        embeddingProvider,
        vectorStore,
        identifierProvider,
        promiseProvider,
        metricsProvider,
        { collectionName: CONFIG.vectorStore.COLLECTION_NAME },
    );

    const tableIngestionWorker = new TableIngestionWorker(
        documentParser,
        embeddingProvider,
        vectorStore,
        identifierProvider,
        promiseProvider,
        metricsProvider,
        { collectionName: CONFIG.vectorStore.COLLECTION_NAME },
    );

    // 2. Instancia as Pipelines
    const infoPipeline = new ExtractInfoPipeline(
        pdfIngestionWorker,
        embeddingProvider,
        vectorStore,
        new EditalFieldExtractorAgent(fieldModel),
        prettifyProvider,
    );

    const itemsPipeline = new ExtractItemsPipeline(
        tableIngestionWorker,
        embeddingProvider,
        vectorStore,
        new EditalItemExtractorAgent(itemModel),
        promiseProvider,
        prettifyProvider,
    );

    // 3. Retorna o Use Case orquestrador
    return new ExtractEditalData(
        infoPipeline,
        itemsPipeline,
        embeddingProvider,
        new ExtractionSessionProvider(),
        metricsProvider,
        CONFIG.vectorStore,
    );
}

export function makeExtractEditalData(): ExtractEditalDataController {
    return new ExtractEditalDataController(createUseCase());
}

export function makeExtractEditalDataStream(): ExtractEditalDataStreamController {
    return new ExtractEditalDataStreamController(createUseCase());
}
