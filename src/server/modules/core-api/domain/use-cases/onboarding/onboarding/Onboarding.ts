import { PrismaOrganizationRepository } from "@/server/shared/infra/repositories/organization.repository";
import { PrismaCompanyRepository }      from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository }   from "@/server/shared/infra/repositories/membership.repository";
import type { OnboardingControllerSchemas } from "./OnboardingControllerSchemas";

export class Onboarding {
    constructor(
        private readonly organizationRepository: PrismaOrganizationRepository,
        private readonly companyRepository:      PrismaCompanyRepository,
        private readonly membershipRepository:   PrismaMembershipRepository,
    ) {}

    async execute(params: Onboarding.Params): Promise<Onboarding.Response> {
        const { userId, ...companyData } = params;

        const existing = await this.companyRepository.findByCnpj({ cnpj: companyData.cnpj });
        if (existing) {
            throw new Error(`Empresa com CNPJ ${companyData.cnpj} já cadastrada.`);
        }

        const slug = this.buildSlug(companyData.razao_social);

        const organization = await this.organizationRepository.create({
            name: companyData.razao_social,
            slug,
        });

        const company = await this.companyRepository.create({
            ...companyData,
            organizationId: organization.id,
        });

        await this.membershipRepository.createOwner({
            userId,
            organizationId: organization.id,
            companyId:      company.id,
        });

        return { companyId: company.id, organizationId: organization.id };
    }

    private buildSlug(name: string): string {
        const base = name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        return `${base}-${Date.now()}`;
    }
}

export namespace Onboarding {
    export type Params = OnboardingControllerSchemas.Input & { userId: string };
    export type Response = { companyId: string; organizationId: string };
}
