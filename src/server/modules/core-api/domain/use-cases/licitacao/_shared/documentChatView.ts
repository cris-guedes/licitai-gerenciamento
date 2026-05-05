import type {
    ChatMessageRecord,
    ChatMessageSourceRecord,
    DocumentChatMessageWithSources,
    DocumentChatRecord,
} from "@/server/modules/core-api/domain/data/DocumentChatTypes";

export type DocumentChatSourceView = {
    id: string;
    chunkId: string;
    page: number | null;
    score: number;
    snippet: string;
    heading: string | null;
    createdAt: string;
};

export type DocumentChatMessageView = {
    id: string;
    role: ChatMessageRecord["role"];
    content: string;
    metadata: unknown;
    createdAt: string;
    sources: DocumentChatSourceView[];
};

export type DocumentChatView = {
    id: string;
    documentId: string;
    organizationId: string;
    title: string | null;
    createdAt: string;
    updatedAt: string;
};

export class DocumentChatViewMapper {
    static toChatView(chat: DocumentChatRecord): DocumentChatView {
        return {
            ...chat,
            createdAt: chat.createdAt.toISOString(),
            updatedAt: chat.updatedAt.toISOString(),
        };
    }

    static toMessageView(message: DocumentChatMessageWithSources): DocumentChatMessageView {
        return {
            id: message.id,
            role: message.role,
            content: message.content,
            metadata: message.metadata,
            createdAt: message.createdAt.toISOString(),
            sources: message.sources.map(source => this.toSourceView(source)),
        };
    }

    static joinMessagesWithSources(
        messages: ChatMessageRecord[],
        sources: ChatMessageSourceRecord[],
    ): DocumentChatMessageWithSources[] {
        const sourcesByMessageId = new Map<string, ChatMessageSourceRecord[]>();

        for (const source of sources) {
            const current = sourcesByMessageId.get(source.messageId) ?? [];
            current.push(source);
            sourcesByMessageId.set(source.messageId, current);
        }

        return messages.map(message => ({
            ...message,
            sources: sourcesByMessageId.get(message.id) ?? [],
        }));
    }

    private static toSourceView(source: ChatMessageSourceRecord): DocumentChatSourceView {
        return {
            ...source,
            createdAt: source.createdAt.toISOString(),
        };
    }
}
