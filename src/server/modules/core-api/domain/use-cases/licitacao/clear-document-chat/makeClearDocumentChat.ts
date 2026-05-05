import { PrismaChatMessageRepository } from "@/server/shared/infra/repositories/chat-message.repository";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentChatRepository } from "@/server/shared/infra/repositories/document-chat.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { ClearDocumentChat } from "./ClearDocumentChat";
import { ClearDocumentChatController } from "./ClearDocumentChatController";

export function makeClearDocumentChat() {
    const useCase = new ClearDocumentChat(
        new PrismaDocumentChatRepository(),
        new PrismaChatMessageRepository(),
        new PrismaDocumentRepository(),
        new PrismaCompanyRepository(),
        new PrismaMembershipRepository(),
    );

    return new ClearDocumentChatController(useCase);
}
