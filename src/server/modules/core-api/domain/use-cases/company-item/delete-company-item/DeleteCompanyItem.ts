/* eslint-disable @typescript-eslint/no-namespace */
import { PrismaCompanyItemRepository } from "@/server/shared/infra/repositories/company-item.repository";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import { CompanyItemProfileMapper } from "../_shared/companyItemProfile";
import type { DeleteCompanyItemDTO } from "./dtos/DeleteCompanyItemDTOs";
import type { DeleteCompanyItemView } from "./dtos/DeleteCompanyItemView";

export class DeleteCompanyItem {
    constructor(
        private readonly companyItemRepository: PrismaCompanyItemRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: DeleteCompanyItem.Params): Promise<DeleteCompanyItem.Response> {
        await assertUserCanAccessCompany({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        const existing = await this.companyItemRepository.findById({ id: params.companyItemId });

        if (!existing || existing.companyId !== params.companyId) {
            throw new Error("Item da empresa não encontrado.");
        }

        const deleted = await this.companyItemRepository.delete({ id: params.companyItemId });

        return CompanyItemProfileMapper.toView(deleted);
    }
}

export namespace DeleteCompanyItem {
    export type Params = DeleteCompanyItemDTO & { userId: string };
    export type Response = DeleteCompanyItemView;
}
