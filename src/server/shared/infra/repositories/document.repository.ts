/* eslint-disable @typescript-eslint/no-namespace */
import { DocumentStatus, DocumentType } from "@prisma/client";
import type { IObjectStorageProvider } from "@/server/modules/core-api/domain/data/IObjectStorageProvider";
import { prisma } from "../db/client";

export class PrismaDocumentRepository {
    async create(data: PrismaDocumentRepository.CreateParams): Promise<PrismaDocumentRepository.DocumentResponse> {
        return prisma.document.create({ data });
    }

    async findById({ id }: { id: string }): Promise<PrismaDocumentRepository.DocumentResponse | null> {
        return prisma.document.findUnique({ where: { id } });
    }

    async findByIdWithPublicImageUrl(
        params: PrismaDocumentRepository.FindByIdWithPublicImageUrlParams,
    ): Promise<PrismaDocumentRepository.DocumentWithPublicImageUrlResponse | null> {
        const document = await this.findById({ id: params.id });
        if (!document) return null;

        const temporaryUrl = await params.objectStorageProvider.getDocumentTemporaryUrl({
            key: document.storageKey,
            bucket: document.storageBucket,
            filename: document.originalName,
            contentType: document.mimeType,
            expiresInSeconds: params.expiresInSeconds,
        });

        return {
            ...document,
            publicImageUrl: temporaryUrl.url,
            publicImageUrlExpiresAt: temporaryUrl.expiresAt,
        };
    }

    async update({ id, data }: PrismaDocumentRepository.UpdateParams): Promise<PrismaDocumentRepository.DocumentResponse> {
        return prisma.document.update({
            where: { id },
            data,
        });
    }

    async findManyByEditalId({ editalId }: PrismaDocumentRepository.FindManyByEditalIdParams): Promise<PrismaDocumentRepository.DocumentResponse[]> {
        return prisma.document.findMany({
            where: { editalId },
            orderBy: [
                { createdAt: "asc" },
                { originalName: "asc" },
            ],
        });
    }

    async delete({ id }: PrismaDocumentRepository.DeleteParams): Promise<PrismaDocumentRepository.DocumentResponse> {
        return prisma.document.delete({
            where: { id },
        });
    }
}

export namespace PrismaDocumentRepository {
    export type CreateParams = {
        id: string;
        companyId: string;
        editalId?: string | null;
        createdById?: string | null;
        type: DocumentType;
        originalName: string;
        mimeType: string;
        sizeBytes: number;
        storageProvider: string;
        storageBucket: string;
        storageKey: string;
        storageUrl: string;
        vectorDocumentId: string;
        vectorCollectionName: string;
        status: DocumentStatus;
    };

    export type DocumentResponse = {
        id: string;
        companyId: string;
        editalId: string | null;
        createdById: string | null;
        type: DocumentType;
        originalName: string;
        mimeType: string;
        sizeBytes: number;
        storageProvider: string;
        storageBucket: string;
        storageKey: string;
        storageUrl: string;
        vectorDocumentId: string;
        vectorCollectionName: string;
        status: DocumentStatus;
        createdAt: Date;
        updatedAt: Date;
    };

    export type UpdateData = Partial<Omit<CreateParams, "id" | "companyId" | "createdById">>;

    export type UpdateParams = {
        id: string;
        data: UpdateData;
    };

    export type DocumentWithPublicImageUrlResponse = DocumentResponse & {
        publicImageUrl: string;
        publicImageUrlExpiresAt: Date;
    };

    export type FindByIdWithPublicImageUrlParams = {
        id: string;
        objectStorageProvider: IObjectStorageProvider.Contract;
        expiresInSeconds?: number;
    };

    export type FindManyByEditalIdParams = {
        editalId: string;
    };

    export type DeleteParams = {
        id: string;
    };
}
