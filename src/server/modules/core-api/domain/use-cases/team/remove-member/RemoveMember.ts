import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { RemoveMemberMapper, type RemoveMemberView } from "./dtos/RemoveMemberView";
import type { RemoveMemberDTO } from "./dtos/RemoveMemberDTOs";

export class RemoveMember {
    constructor(
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: RemoveMember.Params): Promise<RemoveMember.Response> {
        const membership = await this.membershipRepository.findById({ id: params.membershipId });

        if (!membership) {
            throw new Error("Membro não encontrado.");
        }

        if (membership.role === "OWNER") {
            throw new Error("Não é possível remover o proprietário da organização.");
        }

        await this.membershipRepository.delete({ id: params.membershipId });

        return RemoveMemberMapper.toView();
    }
}

export namespace RemoveMember {
    export type Params   = RemoveMemberDTO;
    export type Response = RemoveMemberView;
}
