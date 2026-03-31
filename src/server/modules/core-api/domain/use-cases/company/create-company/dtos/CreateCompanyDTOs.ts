import type { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";

export interface CreateCompanyDTO extends Omit<PrismaCompanyRepository.CreateParams, "cnaes_secundarios"> {
    cnaes_secundarios?: PrismaCompanyRepository.CompanySecondaryCnae[] | null;
}
