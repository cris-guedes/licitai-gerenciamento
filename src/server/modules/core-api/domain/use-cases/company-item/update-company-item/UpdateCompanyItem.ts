/* eslint-disable @typescript-eslint/no-namespace */
import { PrismaCompanyItemRepository } from "@/server/shared/infra/repositories/company-item.repository";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import { CompanyItemProfileMapper } from "../_shared/companyItemProfile";
import type { UpdateCompanyItemDTO } from "./dtos/UpdateCompanyItemDTOs";
import type { UpdateCompanyItemView } from "./dtos/UpdateCompanyItemView";

export class UpdateCompanyItem {
    constructor(
        private readonly companyItemRepository: PrismaCompanyItemRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: UpdateCompanyItem.Params): Promise<UpdateCompanyItem.Response> {
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

        if (params.data.codigo && params.data.codigo !== existing.codigo) {
            const duplicated = await this.companyItemRepository.findByCompanyIdAndCodigo({
                companyId: params.companyId,
                codigo: params.data.codigo,
            });

            if (duplicated && duplicated.id !== existing.id) {
                throw new Error(`Já existe um item com o código ${params.data.codigo} para esta empresa.`);
            }
        }

        const updated = await this.companyItemRepository.update({
            id: params.companyItemId,
            data: params.data,
        });

        return CompanyItemProfileMapper.toView(updated);
    }
}

export namespace UpdateCompanyItem {
    export type Params = UpdateCompanyItemDTO & { userId: string };
    export type Response = UpdateCompanyItemView;
}
