import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";

export type ListMembersDTO = {
    organizationId: string;
};

export type ListMemberItemDTO = PrismaMembershipRepository.MembershipWithUser;
