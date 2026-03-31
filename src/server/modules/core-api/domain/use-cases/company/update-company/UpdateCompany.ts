import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserBelongsToOrganization } from "../_shared/assertCompanyAccess";
import { CompanyProfileMapper, type CompanyProfileView } from "../_shared/companyProfile";
import type { UpdateCompanyDTO } from "./dtos/UpdateCompanyDTOs";

export class UpdateCompany {
    constructor(
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: UpdateCompany.Params): Promise<UpdateCompany.Response> {
        const existing = await this.companyRepository.findById({ id: params.companyId });

        if (!existing) {
            throw new Error("Empresa não encontrada.");
        }

        await assertUserBelongsToOrganization({
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            organizationId: existing.organizationId,
        });

        if (params.data.cnpj && params.data.cnpj !== existing.cnpj) {
            const companyWithSameCnpj = await this.companyRepository.findByCnpj({ cnpj: params.data.cnpj });

            if (companyWithSameCnpj && companyWithSameCnpj.id !== params.companyId) {
                throw new Error(`Empresa com CNPJ ${params.data.cnpj} já cadastrada.`);
            }
        }

        const updated = await this.companyRepository.update({
            id: params.companyId,
            data: {
                ...params.data,
                cnaes_secundarios: params.data.cnaes_secundarios,
            },
        });

        return CompanyProfileMapper.toView(updated);
    }
}

export namespace UpdateCompany {
    export type Params = UpdateCompanyDTO & { userId: string };
    export type Response = CompanyProfileView;
}
