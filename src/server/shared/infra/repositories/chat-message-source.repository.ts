import type { IChatMessageSourceRepository } from "@/server/modules/core-api/domain/data/IChatMessageSourceRepository";
import type { ChatMessageSourceRecord } from "@/server/modules/core-api/domain/data/DocumentChatTypes";
import { prisma } from "../db/client";

export class PrismaChatMessageSourceRepository implements IChatMessageSourceRepository {
    async createMany({
        items,
    }: PrismaChatMessageSourceRepository.CreateManyParams): Promise<void> {
        if (items.length === 0) return;

        await prisma.chatMessageSource.createMany({
            data: items,
        });
    }

    async findByMessageIds({
        messageIds,
    }: PrismaChatMessageSourceRepository.FindByMessageIdsParams): Promise<ChatMessageSourceRecord[]> {
        if (messageIds.length === 0) return [];

        return prisma.chatMessageSource.findMany({
            where: { messageId: { in: messageIds } },
            orderBy: [
                { createdAt: "asc" },
                { score: "desc" },
            ],
        });
    }
}

export namespace PrismaChatMessageSourceRepository {
    export type CreateManyParams = IChatMessageSourceRepository.CreateManyInput;
    export type FindByMessageIdsParams = IChatMessageSourceRepository.FindByMessageIdsInput;
}
