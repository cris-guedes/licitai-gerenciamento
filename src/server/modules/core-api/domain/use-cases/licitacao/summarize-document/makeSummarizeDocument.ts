import { OpenAIEmbeddingProvider } from "@/server/shared/infra/providers/ia/embeding/providers/openai-embedding-provider";
import { DocumentSummaryAgent } from "@/server/shared/infra/providers/ia/agents/document-summary-agent";
import { OpenAIModel } from "@/server/shared/infra/providers/ia/models/openai-model";
import { QdrantDocumentVectorSearchProvider } from "@/server/shared/infra/providers/ia/vector/qdrant-document-vector-search-provider";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentAnalysisRepository } from "@/server/shared/infra/repositories/document-analysis.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { SummarizeDocument } from "./SummarizeDocument";
import { SummarizeDocumentController } from "./SummarizeDocumentController";

export function makeSummarizeDocument() {
    const embeddingProvider = new OpenAIEmbeddingProvider();
    const vectorSearchProvider = new QdrantDocumentVectorSearchProvider(embeddingProvider, {
        collectionName: process.env.QDRANT_COLLECTION ?? "document_chunks",
    });
    const model = new OpenAIModel({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    });

    const useCase = new SummarizeDocument(
        new DocumentSummaryAgent(model),
        vectorSearchProvider,
        new PrismaDocumentRepository(),
        new PrismaDocumentAnalysisRepository(),
        new PrismaCompanyRepository(),
        new PrismaMembershipRepository(),
    );

    return new SummarizeDocumentController(useCase);
}
