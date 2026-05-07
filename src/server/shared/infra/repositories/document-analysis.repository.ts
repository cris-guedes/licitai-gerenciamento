import { DocumentAnalysisStatus, DocumentAnalysisType, Prisma } from "@prisma/client";
import { prisma } from "../db/client";

export class PrismaDocumentAnalysisRepository {
    async create(data: PrismaDocumentAnalysisRepository.CreateParams): Promise<PrismaDocumentAnalysisRepository.DocumentAnalysisResponse> {
        return prisma.documentAnalysis.create({ data });
    }

    async findLatestByDocumentAndType(
        params: PrismaDocumentAnalysisRepository.FindLatestByDocumentAndTypeParams,
    ): Promise<PrismaDocumentAnalysisRepository.DocumentAnalysisResponse | null> {
        return prisma.documentAnalysis.findFirst({
            where: {
                documentId: params.documentId,
                type: params.type,
                ...(params.status ? { status: params.status } : {}),
            },
            orderBy: [
                { finishedAt: "desc" },
                { createdAt: "desc" },
            ],
        });
    }

    async findLatestByDocumentIds(
        params: PrismaDocumentAnalysisRepository.FindLatestByDocumentIdsParams,
    ): Promise<PrismaDocumentAnalysisRepository.DocumentAnalysisResponse[]> {
        if (params.documentIds.length === 0) {
            return [];
        }

        const analyses = await prisma.documentAnalysis.findMany({
            where: {
                documentId: { in: params.documentIds },
                ...(params.types ? { type: { in: params.types } } : {}),
            },
            orderBy: [
                { finishedAt: "desc" },
                { createdAt: "desc" },
            ],
        });

        const latestByKey = new Map<string, PrismaDocumentAnalysisRepository.DocumentAnalysisResponse>();

        for (const analysis of analyses) {
            const key = `${analysis.documentId}:${analysis.type}`;

            if (!latestByKey.has(key)) {
                latestByKey.set(key, analysis);
            }
        }

        return Array.from(latestByKey.values());
    }

    async update({ id, data }: PrismaDocumentAnalysisRepository.UpdateParams): Promise<PrismaDocumentAnalysisRepository.DocumentAnalysisResponse> {
        return prisma.documentAnalysis.update({
            where: { id },
            data: {
                ...data,
                result: this.toJsonInput(data.result),
                metrics: this.toJsonInput(data.metrics),
            },
        });
    }

    private toJsonInput(value: Prisma.InputJsonValue | null | undefined) {
        if (value === undefined) return undefined;
        if (value === null) return Prisma.JsonNull;
        return value;
    }
}

export namespace PrismaDocumentAnalysisRepository {
    export type CreateParams = {
        documentId: string;
        companyId: string;
        createdById?: string | null;
        type: DocumentAnalysisType;
        status: DocumentAnalysisStatus;
        startedAt?: Date | null;
    };

    export type DocumentAnalysisResponse = {
        id: string;
        documentId: string;
        companyId: string;
        createdById: string | null;
        type: DocumentAnalysisType;
        status: DocumentAnalysisStatus;
        markdownContent: string | null;
        result: Prisma.JsonValue | null;
        metrics: Prisma.JsonValue | null;
        errorMessage: string | null;
        startedAt: Date | null;
        finishedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    };

    export type UpdateData = {
        status?: DocumentAnalysisStatus;
        markdownContent?: string | null;
        result?: Prisma.InputJsonValue | null;
        metrics?: Prisma.InputJsonValue | null;
        errorMessage?: string | null;
        startedAt?: Date | null;
        finishedAt?: Date | null;
    };

    export type UpdateParams = {
        id: string;
        data: UpdateData;
    };

    export type FindLatestByDocumentAndTypeParams = {
        documentId: string;
        type: DocumentAnalysisType;
        status?: DocumentAnalysisStatus;
    };

    export type FindLatestByDocumentIdsParams = {
        documentIds: string[];
        types?: DocumentAnalysisType[];
    };
}
