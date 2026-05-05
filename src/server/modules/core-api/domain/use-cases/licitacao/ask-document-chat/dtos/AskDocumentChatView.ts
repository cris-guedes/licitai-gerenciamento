import type { DocumentChatMessageView, DocumentChatView } from "../../_shared/documentChatView";

export type AskDocumentChatView = {
    chat: DocumentChatView;
    userMessage: DocumentChatMessageView;
    assistantMessage: DocumentChatMessageView;
};

export class AskDocumentChatMapper {
    static toView(data: AskDocumentChatView): AskDocumentChatView {
        return data;
    }
}
