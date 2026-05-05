import type { IDocumentChatRepository } from "@/server/modules/core-api/domain/data/IDocumentChatRepository";
import type { DocumentChatRecord } from "@/server/modules/core-api/domain/data/DocumentChatTypes";

export async function ensureDocumentChat(params: {
    documentChatRepository: IDocumentChatRepository;
    documentId: string;
    organizationId: string;
    title?: string | null;
}): Promise<DocumentChatRecord> {
    const existingChat = await params.documentChatRepository.findByDocumentId({
        documentId: params.documentId,
    });

    if (existingChat) {
        return existingChat;
    }

    return params.documentChatRepository.create({
        documentId: params.documentId,
        organizationId: params.organizationId,
        title: params.title,
    });
}
