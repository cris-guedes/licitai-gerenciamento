import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserBelongsToOrganization } from "../_shared/assertCompanyAccess";
import { CompanyProfileMapper, type CompanyProfileView } from "../_shared/companyProfile";
import type { FetchCompanyByIdDTO } from "./dtos/FetchCompanyByIdDTOs";

export class FetchCompanyById {
    constructor(
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: FetchCompanyById.Params): Promise<FetchCompanyById.Response> {
        const company = await this.companyRepository.findById({ id: params.companyId });

        if (!company) {
            throw new Error("Empresa não encontrada.");
        }

        await assertUserBelongsToOrganization({
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            organizationId: company.organizationId,
        });

        return CompanyProfileMapper.toView(company);
    }
}

export namespace FetchCompanyById {
    export type Params = FetchCompanyByIdDTO & { userId: string };
    export type Response = CompanyProfileView;
}
