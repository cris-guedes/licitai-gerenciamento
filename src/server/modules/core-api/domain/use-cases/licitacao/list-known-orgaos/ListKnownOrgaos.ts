/* eslint-disable @typescript-eslint/no-namespace */
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";

export class ListKnownOrgaos {
    constructor(
        private readonly oportunidadeRepository: PrismaOportunidadeRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: ListKnownOrgaos.Params): Promise<ListKnownOrgaos.Response> {
        await assertUserCanAccessCompany({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        const orgaos = await this.oportunidadeRepository.listKnownOrgaosByCompanyId({
            companyId: params.companyId,
        });

        return { orgaos };
    }
}

export namespace ListKnownOrgaos {
    export type Params = {
        companyId: string;
        userId: string;
    };

    export type Response = {
        orgaos: PrismaOportunidadeRepository.KnownOrgaoRecord[];
    };
}
