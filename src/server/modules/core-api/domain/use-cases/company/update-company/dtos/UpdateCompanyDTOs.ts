import type { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";

export interface UpdateCompanyDTO {
    companyId: string;
    data: Partial<Omit<PrismaCompanyRepository.CreateParams, "organizationId" | "cnaes_secundarios">> & {
        cnaes_secundarios?: PrismaCompanyRepository.CompanySecondaryCnae[] | null;
    };
}
