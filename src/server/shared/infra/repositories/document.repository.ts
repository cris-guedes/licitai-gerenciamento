import { prisma } from "../db/client";

export class PrismaDocumentRepository {
    async create(data: PrismaDocumentRepository.CreateParams): Promise<PrismaDocumentRepository.DocumentResponse> {
        return prisma.document.create({ data });
    }

    async findById({ id }: { id: string }): Promise<PrismaDocumentRepository.DocumentResponse | null> {
        return prisma.document.findUnique({ where: { id } });
    }

    async listByEdital(params: { editalId: string }): Promise<PrismaDocumentRepository.DocumentResponse[]> {
        return prisma.document.findMany({
            where: { editalId: params.editalId },
            orderBy: { createdAt: "desc" },
        });
    }
}

export namespace PrismaDocumentRepository {
    export type CreateParams = {
        orgId: string;
        companyId: string;
        editalId: string;
        type: string;
        url: string;
        publishedAt?: Date | null;
    };

    export type DocumentResponse = {
        id: string;
        orgId: string;
        companyId: string;
        editalId: string;
        type: string;
        url: string;
        publishedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    };
}
