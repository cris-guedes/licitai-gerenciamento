import type { ChatMessageRecord, DocumentChatRole } from "./DocumentChatTypes";

export interface IChatMessageRepository {
    create(input: IChatMessageRepository.CreateInput): Promise<ChatMessageRecord>;
    findManyByChatId(input: IChatMessageRepository.FindManyByChatIdInput): Promise<ChatMessageRecord[]>;
    findRecentByChatId(input: IChatMessageRepository.FindRecentByChatIdInput): Promise<ChatMessageRecord[]>;
    deleteByChatId(input: IChatMessageRepository.DeleteByChatIdInput): Promise<void>;
}

export namespace IChatMessageRepository {
    export type CreateInput = {
        chatId: string;
        role: DocumentChatRole;
        content: string;
        metadata?: unknown;
    };

    export type FindManyByChatIdInput = {
        chatId: string;
        limit?: number;
    };

    export type FindRecentByChatIdInput = {
        chatId: string;
        limit: number;
    };

    export type DeleteByChatIdInput = {
        chatId: string;
    };
}
