import { DocumentHandlerFileParsingProvider } from "@/server/shared/infra/providers/pdf/document-handler-file-parsing-provider";
import { EditalDraftPreviewAgent } from "@/server/shared/infra/providers/ia/agents/edital-draft-preview-agent";
import { OpenAIEmbeddingProvider } from "@/server/shared/infra/providers/ia/embeding/providers/openai-embedding-provider";
import { OpenAIModel } from "@/server/shared/infra/providers/ia/models/openai-model";
import { QdrantVectorStore } from "@/server/shared/infra/providers/ia/vector/qdrant-vector-store";
import { MetricsProvider } from "@/server/shared/infra/providers/metrics/metrics-provider";
import { UuidIdentifierProvider } from "@/server/shared/infra/providers/identifier/uuid-identifier-provider";
import { PQueuePromiseProvider } from "@/server/shared/infra/providers/promise/p-queue-promise-provider";
import { CloudflareR2ObjectStorageProvider } from "@/server/shared/infra/providers/storage/cloudflare-r2-object-storage-provider";
import { PdfIngestionWorker } from "@/server/modules/core-api/workers/pdf-ingestion/PdfIngestionWorker";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaLicitacaoRepository } from "@/server/shared/infra/repositories/licitacao.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { DraftPreviewExtractor } from "../_shared/DraftPreviewExtractor";
import { UploadLicitacaoDocument } from "./UploadLicitacaoDocument";
import { UploadLicitacaoDocumentStreamController } from "./UploadLicitacaoDocumentStreamController";

const CONFIG = {
    embedding: {
        model: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
        dimensions: 1536,
        batchSize: 256,
        maxConcurrency: 5,
    },
    vectorStore: {
        collectionName: process.env.QDRANT_COLLECTION ?? "document_chunks",
        embeddingConcurrency: 5,
        storeConcurrency: 5,
    },
    draftPreviewModel: process.env.OPENAI_LIGHT_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini",
};

export function makeUploadLicitacaoDocumentStream(): UploadLicitacaoDocumentStreamController {
    const metricsProvider = new MetricsProvider();
    const documentParser = new DocumentHandlerFileParsingProvider();
    const embeddingProvider = new OpenAIEmbeddingProvider({
        model: CONFIG.embedding.model,
        dimensions: CONFIG.embedding.dimensions,
        batchSize: CONFIG.embedding.batchSize,
        maxConcurrency: CONFIG.embedding.maxConcurrency,
    });
    const vectorStore = new QdrantVectorStore();
    const pdfIngestionWorker = new PdfIngestionWorker(
        documentParser,
        embeddingProvider,
        vectorStore,
        new UuidIdentifierProvider(),
        new PQueuePromiseProvider(),
        metricsProvider,
        { collectionName: CONFIG.vectorStore.collectionName },
    );
    const draftPreviewExtractor = new DraftPreviewExtractor(
        documentParser,
        new EditalDraftPreviewAgent(new OpenAIModel({ model: CONFIG.draftPreviewModel })),
    );

    return new UploadLicitacaoDocumentStreamController(
        new UploadLicitacaoDocument(
            new UuidIdentifierProvider(),
            new CloudflareR2ObjectStorageProvider(),
            vectorStore,
            pdfIngestionWorker,
            new PrismaLicitacaoRepository(),
            new PrismaDocumentRepository(),
            new PrismaCompanyRepository(),
            new PrismaMembershipRepository(),
            draftPreviewExtractor,
            {
                vectorCollectionName: CONFIG.vectorStore.collectionName,
                embeddingConcurrency: CONFIG.vectorStore.embeddingConcurrency,
                storeConcurrency: CONFIG.vectorStore.storeConcurrency,
            },
        ),
    );
}
