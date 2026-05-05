import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";

export async function assertUserBelongsToOrganization(params: {
    membershipRepository: PrismaMembershipRepository;
    userId: string;
    organizationId: string;
}) {
    const membership = await params.membershipRepository.findByUserIdAndOrganizationId({
        userId: params.userId,
        organizationId: params.organizationId,
    });

    if (!membership) {
        throw new Error("Você não tem acesso a esta organização.");
    }

    return membership;
}

export async function assertUserCanAccessCompany(params: {
    companyRepository: PrismaCompanyRepository;
    membershipRepository: PrismaMembershipRepository;
    userId: string;
    companyId: string;
}) {
    const company = await params.companyRepository.findById({ id: params.companyId });

    if (!company) {
        throw new Error("Empresa não encontrada.");
    }

    await assertUserBelongsToOrganization({
        membershipRepository: params.membershipRepository,
        userId: params.userId,
        organizationId: company.organizationId,
    });

    return company;
}
