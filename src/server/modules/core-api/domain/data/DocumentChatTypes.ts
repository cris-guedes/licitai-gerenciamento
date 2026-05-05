export type DocumentChatRole = "user" | "assistant" | "system";

export type DocumentChatRecord = {
    id: string;
    documentId: string;
    organizationId: string;
    title: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type ChatMessageRecord = {
    id: string;
    chatId: string;
    role: DocumentChatRole;
    content: string;
    metadata: unknown;
    createdAt: Date;
};

export type ChatMessageSourceRecord = {
    id: string;
    messageId: string;
    chunkId: string;
    page: number | null;
    score: number;
    snippet: string;
    heading: string | null;
    createdAt: Date;
};

export type DocumentChatMessageWithSources = ChatMessageRecord & {
    sources: ChatMessageSourceRecord[];
};
