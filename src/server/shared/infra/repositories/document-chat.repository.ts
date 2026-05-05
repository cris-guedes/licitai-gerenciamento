import type { IDocumentChatRepository } from "@/server/modules/core-api/domain/data/IDocumentChatRepository";
import type { DocumentChatRecord } from "@/server/modules/core-api/domain/data/DocumentChatTypes";
import { prisma } from "../db/client";

export class PrismaDocumentChatRepository implements IDocumentChatRepository {
    async findByDocumentId({
        documentId,
    }: PrismaDocumentChatRepository.FindByDocumentIdParams): Promise<DocumentChatRecord | null> {
        return prisma.documentChat.findUnique({
            where: { documentId },
        });
    }

    async create(data: PrismaDocumentChatRepository.CreateParams): Promise<DocumentChatRecord> {
        return prisma.documentChat.create({ data });
    }

    async update({
        id,
        data,
    }: PrismaDocumentChatRepository.UpdateParams): Promise<DocumentChatRecord> {
        return prisma.documentChat.update({
            where: { id },
            data,
        });
    }
}

export namespace PrismaDocumentChatRepository {
    export type FindByDocumentIdParams = IDocumentChatRepository.FindByDocumentIdInput;
    export type CreateParams = IDocumentChatRepository.CreateInput;
    export type UpdateData = IDocumentChatRepository.UpdateInput["data"];
    export type UpdateParams = IDocumentChatRepository.UpdateInput;
}
