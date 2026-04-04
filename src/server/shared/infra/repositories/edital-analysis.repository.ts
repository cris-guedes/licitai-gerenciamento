import { prisma } from "../db/client";
import type { EditalExtraction } from "../providers/ai/AiProvider";

export class PrismaEditalAnalysisRepository {
    async create(data: PrismaEditalAnalysisRepository.CreateParams): Promise<PrismaEditalAnalysisRepository.EditalAnalysisResponse> {
        const { documentIds, ...rest } = data;
        return prisma.editalAnalysis.create({
            data: {
                ...rest,
                documents: documentIds?.length
                    ? { create: documentIds.map((documentId) => ({ documentId })) }
                    : undefined,
            },
            include: { documents: true },
        }) as unknown as Promise<PrismaEditalAnalysisRepository.EditalAnalysisResponse>;
    }

    async update(id: string, data: PrismaEditalAnalysisRepository.UpdateParams): Promise<PrismaEditalAnalysisRepository.EditalAnalysisResponse> {
        return prisma.editalAnalysis.update({
            where: { id },
            data:  data as any,
            include: { documents: true },
        }) as unknown as Promise<PrismaEditalAnalysisRepository.EditalAnalysisResponse>;
    }

    async findById(id: string): Promise<PrismaEditalAnalysisRepository.EditalAnalysisResponse | null> {
        return prisma.editalAnalysis.findUnique({
            where: { id },
            include: { documents: true },
        }) as unknown as Promise<PrismaEditalAnalysisRepository.EditalAnalysisResponse | null>;
    }

    async listByEdital(editalId: string): Promise<PrismaEditalAnalysisRepository.EditalAnalysisResponse[]> {
        return prisma.editalAnalysis.findMany({
            where: { editalId },
            orderBy: { version: "desc" },
            include: { documents: true },
        }) as unknown as Promise<PrismaEditalAnalysisRepository.EditalAnalysisResponse[]>;
    }

    async nextVersion(editalId: string): Promise<number> {
        const last = await prisma.editalAnalysis.findFirst({
            where: { editalId },
            orderBy: { version: "desc" },
            select: { version: true },
        });
        return (last?.version ?? 0) + 1;
    }
}

export namespace PrismaEditalAnalysisRepository {
    export type CreateParams = {
        orgId: string;
        companyId: string;
        editalId: string;
        version: number;
        status: string;
        documentIds?: string[];
    };

    export type UpdateParams = Partial<EditalExtraction & {
        status: string;
        approvedAt: Date | null;
        approvedById: string | null;
        publicationDate: Date | null;
        openingDate: Date | null;
        proposalDeadline: Date | null;
        clarificationDeadline: Date | null;
    }>;

    export type EditalAnalysisResponse = {
        id: string;
        orgId: string;
        companyId: string;
        editalId: string;
        version: number;
        status: string;
        approvedAt: Date | null;
        approvedById: string | null;
        editalNumber: string | null;
        portal: string | null;
        sphere: string | null;
        state: string | null;
        object: string | null;
        modality: string | null;
        contractType: string | null;
        editalUrl: string | null;
        estimatedValue: number | null;
        publicationDate: Date | null;
        openingDate: Date | null;
        proposalDeadline: Date | null;
        processNumber: string | null;
        uasg: string | null;
        proposalDeadlineTime: string | null;
        bidInterval: number | null;
        judgmentCriteria: string | null;
        disputeMode: string | null;
        proposalValidityDays: number | null;
        clarificationDeadline: Date | null;
        regionality: string | null;
        exclusiveSmallBusiness: boolean | null;
        allowsAdhesion: boolean | null;
        extractedRules: unknown;
        extractedLogistics: unknown;
        extractedRequiredDocuments: unknown;
        extractedManagingAgencies: unknown;
        extractedParticipatingAgencies: unknown;
        createdAt: Date;
        updatedAt: Date;
        documents: { id: string; documentId: string }[];
    };
}
