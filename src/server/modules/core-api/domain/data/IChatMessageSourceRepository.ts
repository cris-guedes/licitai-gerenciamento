import type { ChatMessageSourceRecord } from "./DocumentChatTypes";

export interface IChatMessageSourceRepository {
    createMany(input: IChatMessageSourceRepository.CreateManyInput): Promise<void>;
    findByMessageIds(input: IChatMessageSourceRepository.FindByMessageIdsInput): Promise<ChatMessageSourceRecord[]>;
}

export namespace IChatMessageSourceRepository {
    export type CreateManyInput = {
        items: Array<{
            messageId: string;
            chunkId: string;
            page?: number | null;
            score: number;
            snippet: string;
            heading?: string | null;
        }>;
    };

    export type FindByMessageIdsInput = {
        messageIds: string[];
    };
}
