/* eslint-disable @typescript-eslint/no-namespace */
import type { IChatMessageRepository } from "@/server/modules/core-api/domain/data/IChatMessageRepository";
import type { IDocumentChatRepository } from "@/server/modules/core-api/domain/data/IDocumentChatRepository";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaDocumentRepository } from "@/server/shared/infra/repositories/document.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserCanAccessDocument } from "../_shared/assertDocumentAccess";
import { ensureDocumentChat } from "../_shared/ensureDocumentChat";
import type { ClearDocumentChatDTO } from "./dtos/ClearDocumentChatDTOs";
import { ClearDocumentChatMapper, type ClearDocumentChatView } from "./dtos/ClearDocumentChatView";

export class ClearDocumentChat {
    constructor(
        private readonly documentChatRepository: IDocumentChatRepository,
        private readonly chatMessageRepository: IChatMessageRepository,
        private readonly documentRepository: PrismaDocumentRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: ClearDocumentChat.Params): Promise<ClearDocumentChat.Response> {
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

        await this.chatMessageRepository.deleteByChatId({
            chatId: chat.id,
        });

        await this.documentChatRepository.update({
            id: chat.id,
            data: {
                updatedAt: new Date(),
            },
        });

        return ClearDocumentChatMapper.toView(chat.id);
    }
}

export namespace ClearDocumentChat {
    export type Params = ClearDocumentChatDTO;
    export type Response = ClearDocumentChatView;
}
