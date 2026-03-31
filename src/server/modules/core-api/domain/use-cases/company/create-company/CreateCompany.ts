import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserBelongsToOrganization } from "../_shared/assertCompanyAccess";
import { CompanyProfileMapper, type CompanyProfileView } from "../_shared/companyProfile";
import type { CreateCompanyDTO } from "./dtos/CreateCompanyDTOs";

export class CreateCompany {
    constructor(
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: CreateCompany.Params): Promise<CreateCompany.Response> {
        await assertUserBelongsToOrganization({
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            organizationId: params.organizationId,
        });

        const existing = await this.companyRepository.findByCnpj({ cnpj: params.cnpj });

        if (existing) {
            throw new Error(`Empresa com CNPJ ${params.cnpj} já cadastrada.`);
        }

        const company = await this.companyRepository.create({
            ...params,
            cnaes_secundarios: params.cnaes_secundarios ?? null,
        });

        return CompanyProfileMapper.toView(company);
    }
}

export namespace CreateCompany {
    export type Params = CreateCompanyDTO & { userId: string };
    export type Response = CompanyProfileView;
}
