import { prisma } from "../db/client";

export class PrismaEditalRepository {
    async create(data: PrismaEditalRepository.CreateParams): Promise<PrismaEditalRepository.EditalResponse> {
        return prisma.edital.create({ data });
    }

    async findById({ id }: { id: string }): Promise<PrismaEditalRepository.EditalResponse | null> {
        return prisma.edital.findUnique({ where: { id } });
    }

    async findByOrgAndCompany(params: { orgId: string; companyId: string }): Promise<PrismaEditalRepository.EditalResponse[]> {
        return prisma.edital.findMany({
            where: { orgId: params.orgId, companyId: params.companyId },
            orderBy: { createdAt: "desc" },
        });
    }

    async listWithTender(params: { orgId: string; companyId: string }): Promise<PrismaEditalRepository.LicitacaoListItem[]> {
        return prisma.edital.findMany({
            where: { orgId: params.orgId, companyId: params.companyId },
            orderBy: { createdAt: "desc" },
            include: { tender: true },
        }) as Promise<PrismaEditalRepository.LicitacaoListItem[]>;
    }
}

export namespace PrismaEditalRepository {
    export type CreateParams = {
        orgId: string;
        companyId: string;
        object?: string | null;
        modality?: string | null;
        contractType?: string | null;
        estimatedValue?: number | null;
        openingDate?: Date | null;
    };

    export type EditalResponse = {
        id: string;
        orgId: string;
        companyId: string;
        object: string | null;
        modality: string | null;
        contractType: string | null;
        estimatedValue: number | null;
        openingDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
    };

    export type LicitacaoListItem = {
        id: string;
        orgId: string;
        companyId: string;
        editalNumber: string | null;
        portal: string | null;
        sphere: string | null;
        state: string | null;
        object: string | null;
        modality: string | null;
        contractType: string | null;
        estimatedValue: number | null;
        publicationDate: Date | null;
        openingDate: Date | null;
        proposalDeadline: Date | null;
        editalUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        tender: {
            id: string;
            status: string | null;
            phase: string | null;
        } | null;
    };
}
