export type ClearDocumentChatView = {
    chatId: string;
    cleared: true;
};

export class ClearDocumentChatMapper {
    static toView(chatId: string): ClearDocumentChatView {
        return {
            chatId,
            cleared: true,
        };
    }
}
