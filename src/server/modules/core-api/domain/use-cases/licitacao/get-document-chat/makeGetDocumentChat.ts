import { PrismaChatMessageRepository } from "@/server/shared/infra/repositories/chat-message.repository";
import { PrismaChatMessageSourceRepository } from "@/server/shared/infra/repositories/chat-message-source.repository";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentChatRepository } from "@/server/shared/infra/repositories/document-chat.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { GetDocumentChat } from "./GetDocumentChat";
import { GetDocumentChatController } from "./GetDocumentChatController";

export function makeGetDocumentChat() {
    const useCase = new GetDocumentChat(
        new PrismaDocumentChatRepository(),
        new PrismaChatMessageRepository(),
        new PrismaChatMessageSourceRepository(),
        new PrismaDocumentRepository(),
        new PrismaCompanyRepository(),
        new PrismaMembershipRepository(),
    );

    return new GetDocumentChatController(useCase);
}
