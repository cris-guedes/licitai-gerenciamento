import type { DocumentChatRecord } from "./DocumentChatTypes";

export interface IDocumentChatRepository {
    findByDocumentId(input: IDocumentChatRepository.FindByDocumentIdInput): Promise<DocumentChatRecord | null>;
    create(input: IDocumentChatRepository.CreateInput): Promise<DocumentChatRecord>;
    update(input: IDocumentChatRepository.UpdateInput): Promise<DocumentChatRecord>;
}

export namespace IDocumentChatRepository {
    export type FindByDocumentIdInput = {
        documentId: string;
    };

    export type CreateInput = {
        documentId: string;
        organizationId: string;
        title?: string | null;
    };

    export type UpdateInput = {
        id: string;
        data: {
            title?: string | null;
            updatedAt?: Date;
        };
    };
}
