/* eslint-disable @typescript-eslint/no-namespace */
import { PrismaCompanyItemRepository } from "@/server/shared/infra/repositories/company-item.repository";
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import { CompanyItemProfileMapper } from "../_shared/companyItemProfile";
import type { CreateCompanyItemDTO } from "./dtos/CreateCompanyItemDTOs";
import type { CreateCompanyItemView } from "./dtos/CreateCompanyItemView";

export class CreateCompanyItem {
    constructor(
        private readonly companyItemRepository: PrismaCompanyItemRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: CreateCompanyItem.Params): Promise<CreateCompanyItem.Response> {
        await assertUserCanAccessCompany({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        const existing = await this.companyItemRepository.findByCompanyIdAndCodigo({
            companyId: params.companyId,
            codigo: params.codigo,
        });

        if (existing) {
            throw new Error(`Já existe um item com o código ${params.codigo} para esta empresa.`);
        }

        const item = await this.companyItemRepository.create({
            companyId: params.companyId,
            codigo: params.codigo,
            descricao: params.descricao,
            marca: params.marca ?? null,
            unidadeMedida: params.unidadeMedida,
            imageUrl: params.imageUrl ?? null,
            precoReferencia: params.precoReferencia ?? null,
            ativo: params.ativo ?? true,
        });

        return CompanyItemProfileMapper.toView(item);
    }
}

export namespace CreateCompanyItem {
    export type Params = CreateCompanyItemDTO & { userId: string };
    export type Response = CreateCompanyItemView;
}
