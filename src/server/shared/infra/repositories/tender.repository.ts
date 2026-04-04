import { prisma } from "../db/client";

export class PrismaTenderRepository {
    async create(data: PrismaTenderRepository.CreateParams): Promise<PrismaTenderRepository.TenderResponse> {
        return prisma.tender.create({ data });
    }

    async findByEditalId({ editalId }: { editalId: string }): Promise<PrismaTenderRepository.TenderResponse | null> {
        return prisma.tender.findUnique({ where: { editalId } });
    }

    async findByOrgAndCompany(params: { orgId: string; companyId: string }): Promise<PrismaTenderRepository.TenderResponse[]> {
        return prisma.tender.findMany({
            where: { orgId: params.orgId, companyId: params.companyId },
            orderBy: { createdAt: "desc" },
        });
    }
}

export namespace PrismaTenderRepository {
    export type CreateParams = {
        orgId: string;
        companyId: string;
        editalId: string;
        status?: string | null;
        phase?: string | null;
    };

    export type TenderResponse = {
        id: string;
        orgId: string;
        companyId: string;
        editalId: string;
        status: string | null;
        phase: string | null;
        createdAt: Date;
        updatedAt: Date;
    };
}
