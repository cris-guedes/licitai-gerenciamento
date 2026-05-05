import type { DocumentChatMessageView, DocumentChatView } from "../../_shared/documentChatView";

export type GetDocumentChatView = {
    chat: DocumentChatView;
    messages: DocumentChatMessageView[];
};

export class GetDocumentChatMapper {
    static toView(data: GetDocumentChatView): GetDocumentChatView {
        return data;
    }
}
