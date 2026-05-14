import { PrismaChatMessageRepository } from "@/server/shared/infra/repositories/chat-message.repository";
import { PrismaChatMessageSourceRepository } from "@/server/shared/infra/repositories/chat-message-source.repository";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentChatRepository } from "@/server/shared/infra/repositories/document-chat.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { GetDocumentChat } from "../../../licitacao/get-document-chat/GetDocumentChat";
import { GetDocumentChatController } from "../../../licitacao/get-document-chat/GetDocumentChatController";

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
