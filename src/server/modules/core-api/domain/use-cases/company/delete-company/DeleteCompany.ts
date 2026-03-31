import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserBelongsToOrganization } from "../_shared/assertCompanyAccess";
import { CompanyProfileMapper, type CompanyProfileView } from "../_shared/companyProfile";
import type { DeleteCompanyDTO } from "./dtos/DeleteCompanyDTOs";

export class DeleteCompany {
    constructor(
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: DeleteCompany.Params): Promise<DeleteCompany.Response> {
        const existing = await this.companyRepository.findById({ id: params.companyId });

        if (!existing) {
            throw new Error("Empresa não encontrada.");
        }

        await assertUserBelongsToOrganization({
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            organizationId: existing.organizationId,
        });

        const deleted = await this.companyRepository.delete({ id: params.companyId });

        return CompanyProfileMapper.toView(deleted);
    }
}

export namespace DeleteCompany {
    export type Params = DeleteCompanyDTO & { userId: string };
    export type Response = CompanyProfileView;
}
