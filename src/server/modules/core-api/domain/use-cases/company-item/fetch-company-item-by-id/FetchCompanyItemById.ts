/* eslint-disable @typescript-eslint/no-namespace */
import { PrismaCompanyItemRepository } from "@/server/shared/infra/repositories/company-item.repository";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import { CompanyItemProfileMapper } from "../_shared/companyItemProfile";
import type { FetchCompanyItemByIdDTO } from "./dtos/FetchCompanyItemByIdDTOs";
import type { FetchCompanyItemByIdView } from "./dtos/FetchCompanyItemByIdView";

export class FetchCompanyItemById {
    constructor(
        private readonly companyItemRepository: PrismaCompanyItemRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: FetchCompanyItemById.Params): Promise<FetchCompanyItemById.Response> {
        await assertUserCanAccessCompany({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        const item = await this.companyItemRepository.findById({ id: params.companyItemId });

        if (!item || item.companyId !== params.companyId) {
            throw new Error("Item da empresa não encontrado.");
        }

        return CompanyItemProfileMapper.toView(item);
    }
}

export namespace FetchCompanyItemById {
    export type Params = FetchCompanyItemByIdDTO & { userId: string };
    export type Response = FetchCompanyItemByIdView;
}
