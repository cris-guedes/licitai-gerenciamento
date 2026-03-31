import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserBelongsToOrganization } from "../_shared/assertCompanyAccess";
import { CompanyProfileMapper } from "../_shared/companyProfile";
import type { ListCompaniesDTO } from "./dtos/ListCompaniesDTOs";
import type { ListCompaniesView } from "./dtos/ListCompaniesView";

export class ListCompanies {
    constructor(
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: ListCompanies.Params): Promise<ListCompanies.Response> {
        await assertUserBelongsToOrganization({
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            organizationId: params.organizationId,
        });

        const companies = await this.companyRepository.findByOrganizationId({
            organizationId: params.organizationId,
        });

        return {
            companies: CompanyProfileMapper.toManyView(companies),
        };
    }
}

export namespace ListCompanies {
    export type Params = ListCompaniesDTO & { userId: string };
    export type Response = ListCompaniesView;
}
