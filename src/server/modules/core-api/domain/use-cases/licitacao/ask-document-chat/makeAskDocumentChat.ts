import { OpenAIEmbeddingProvider } from "@/server/shared/infra/providers/ia/embeding/providers/openai-embedding-provider";
import { OpenAILLMProvider } from "@/server/shared/infra/providers/ia/models/openai-llm-provider";
import { QdrantDocumentVectorSearchProvider } from "@/server/shared/infra/providers/ia/vector/qdrant-document-vector-search-provider";
import { PrismaChatMessageRepository } from "@/server/shared/infra/repositories/chat-message.repository";
import { PrismaChatMessageSourceRepository } from "@/server/shared/infra/repositories/chat-message-source.repository";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentChatRepository } from "@/server/shared/infra/repositories/document-chat.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { AskDocumentChat } from "./AskDocumentChat";
import { AskDocumentChatController } from "./AskDocumentChatController";

export function makeAskDocumentChat() {
    const embeddingProvider = new OpenAIEmbeddingProvider();
    const vectorSearchProvider = new QdrantDocumentVectorSearchProvider(embeddingProvider, {
        collectionName: process.env.QDRANT_COLLECTION ?? "document_chunks",
    });
    const llmProvider = new OpenAILLMProvider({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    });

    const useCase = new AskDocumentChat(
        new PrismaDocumentChatRepository(),
        new PrismaChatMessageRepository(),
        new PrismaChatMessageSourceRepository(),
        vectorSearchProvider,
        llmProvider,
        new PrismaDocumentRepository(),
        new PrismaCompanyRepository(),
        new PrismaMembershipRepository(),
    );

    return new AskDocumentChatController(useCase);
}
