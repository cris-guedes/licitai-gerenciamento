import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { ListMembersMapper, type ListMembersView } from "./dtos/ListMembersView";
import type { ListMembersDTO } from "./dtos/ListMembersDTOs";

export class ListMembers {
    constructor(
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: ListMembers.Params): Promise<ListMembers.Response> {
        const members = await this.membershipRepository.findByOrganizationId({
            organizationId: params.organizationId,
        });

        return ListMembersMapper.toView(members);
    }
}

export namespace ListMembers {
    export type Params   = ListMembersDTO;
    export type Response = ListMembersView;
}
