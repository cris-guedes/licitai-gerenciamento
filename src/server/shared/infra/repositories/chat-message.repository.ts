import { ChatMessageRole, Prisma } from "@prisma/client";
import type { IChatMessageRepository } from "@/server/modules/core-api/domain/data/IChatMessageRepository";
import type { ChatMessageRecord, DocumentChatRole } from "@/server/modules/core-api/domain/data/DocumentChatTypes";
import { prisma } from "../db/client";

export class PrismaChatMessageRepository implements IChatMessageRepository {
    async create(data: PrismaChatMessageRepository.CreateParams): Promise<ChatMessageRecord> {
        const message = await prisma.chatMessage.create({
            data: {
                ...data,
                role: this.toPrismaRole(data.role),
                metadata: this.toJsonInput(data.metadata as Prisma.InputJsonValue | null | undefined),
            },
        });

        return this.toDomainMessage(message);
    }

    async findManyByChatId({
        chatId,
        limit,
    }: PrismaChatMessageRepository.FindManyByChatIdParams): Promise<ChatMessageRecord[]> {
        const messages = await prisma.chatMessage.findMany({
            where: { chatId },
            orderBy: { createdAt: "asc" },
            ...(limit ? { take: limit } : {}),
        });

        return messages.map(message => this.toDomainMessage(message));
    }

    async findRecentByChatId({
        chatId,
        limit,
    }: PrismaChatMessageRepository.FindRecentByChatIdParams): Promise<ChatMessageRecord[]> {
        const messages = await prisma.chatMessage.findMany({
            where: { chatId },
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        return [...messages].reverse().map(message => this.toDomainMessage(message));
    }

    async deleteByChatId({
        chatId,
    }: PrismaChatMessageRepository.DeleteByChatIdParams): Promise<void> {
        await prisma.chatMessage.deleteMany({
            where: { chatId },
        });
    }

    private toJsonInput(value: Prisma.InputJsonValue | null | undefined) {
        if (value === undefined) return undefined;
        if (value === null) return Prisma.JsonNull;
        return value;
    }

    private toPrismaRole(role: DocumentChatRole): ChatMessageRole {
        if (role === "user") return ChatMessageRole.USER;
        if (role === "assistant") return ChatMessageRole.ASSISTANT;
        return ChatMessageRole.SYSTEM;
    }

    private toDomainRole(role: ChatMessageRole): DocumentChatRole {
        if (role === ChatMessageRole.USER) return "user";
        if (role === ChatMessageRole.ASSISTANT) return "assistant";
        return "system";
    }

    private toDomainMessage(message: {
        id: string;
        chatId: string;
        role: ChatMessageRole;
        content: string;
        metadata: Prisma.JsonValue | null;
        createdAt: Date;
    }): ChatMessageRecord {
        return {
            ...message,
            role: this.toDomainRole(message.role),
            metadata: message.metadata,
        };
    }
}

export namespace PrismaChatMessageRepository {
    export type CreateParams = IChatMessageRepository.CreateInput;
    export type FindManyByChatIdParams = IChatMessageRepository.FindManyByChatIdInput;
    export type FindRecentByChatIdParams = IChatMessageRepository.FindRecentByChatIdInput;
    export type DeleteByChatIdParams = IChatMessageRepository.DeleteByChatIdInput;
}
