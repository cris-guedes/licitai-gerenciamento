/* eslint-disable @typescript-eslint/no-namespace */
import { PrismaCompanyItemRepository } from "@/server/shared/infra/repositories/company-item.repository";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import { CompanyItemProfileMapper } from "../_shared/companyItemProfile";
import type { ListCompanyItemsDTO } from "./dtos/ListCompanyItemsDTOs";
import type { ListCompanyItemsView } from "./dtos/ListCompanyItemsView";

export class ListCompanyItems {
    constructor(
        private readonly companyItemRepository: PrismaCompanyItemRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: ListCompanyItems.Params): Promise<ListCompanyItems.Response> {
        await assertUserCanAccessCompany({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        const companyItems = await this.companyItemRepository.listByCompanyId({
            companyId: params.companyId,
        });

        return {
            companyItems: CompanyItemProfileMapper.toManyView(companyItems),
        };
    }
}

export namespace ListCompanyItems {
    export type Params = ListCompanyItemsDTO & { userId: string };
    export type Response = ListCompanyItemsView;
}
