/* eslint-disable @typescript-eslint/no-namespace */
import type { IChatMessageRepository } from "@/server/modules/core-api/domain/data/IChatMessageRepository";
import type { IChatMessageSourceRepository } from "@/server/modules/core-api/domain/data/IChatMessageSourceRepository";
import type { IDocumentChatRepository } from "@/server/modules/core-api/domain/data/IDocumentChatRepository";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserCanAccessDocument } from "../_shared/assertDocumentAccess";
import { DocumentChatViewMapper } from "../_shared/documentChatView";
import { ensureDocumentChat } from "../_shared/ensureDocumentChat";
import type { GetDocumentChatDTO } from "./dtos/GetDocumentChatDTOs";
import { GetDocumentChatMapper, type GetDocumentChatView } from "./dtos/GetDocumentChatView";

export class GetDocumentChat {
    constructor(
        private readonly documentChatRepository: IDocumentChatRepository,
        private readonly chatMessageRepository: IChatMessageRepository,
        private readonly chatMessageSourceRepository: IChatMessageSourceRepository,
        private readonly documentRepository: PrismaDocumentRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: GetDocumentChat.Params): Promise<GetDocumentChat.Response> {
        const { document, company } = await assertUserCanAccessDocument({
            documentRepository: this.documentRepository,
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            documentId: params.documentId,
            userId: params.userId,
        });

        const chat = await ensureDocumentChat({
            documentChatRepository: this.documentChatRepository,
            documentId: document.id,
            organizationId: company.organizationId,
            title: document.originalName,
        });

        const messages = await this.chatMessageRepository.findManyByChatId({
            chatId: chat.id,
        });

        const sources = await this.chatMessageSourceRepository.findByMessageIds({
            messageIds: messages.map(message => message.id),
        });

        const messagesWithSources = DocumentChatViewMapper.joinMessagesWithSources(messages, sources);

        return GetDocumentChatMapper.toView({
            chat: DocumentChatViewMapper.toChatView(chat),
            messages: messagesWithSources.map(message => DocumentChatViewMapper.toMessageView(message)),
        });
    }
}

export namespace GetDocumentChat {
    export type Params = GetDocumentChatDTO;
    export type Response = GetDocumentChatView;
}
