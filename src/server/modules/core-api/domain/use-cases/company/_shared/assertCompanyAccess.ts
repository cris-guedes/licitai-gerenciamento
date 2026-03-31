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
