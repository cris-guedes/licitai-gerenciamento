import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { UpdateMemberRoleMapper, type UpdateMemberRoleView } from "./dtos/UpdateMemberRoleView";
import type { UpdateMemberRoleDTO } from "./dtos/UpdateMemberRoleDTOs";

export class UpdateMemberRole {
    constructor(
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: UpdateMemberRole.Params): Promise<UpdateMemberRole.Response> {
        const membership = await this.membershipRepository.findById({ id: params.membershipId });

        if (!membership) {
            throw new Error("Membro não encontrado.");
        }

        if (membership.role === "OWNER") {
            throw new Error("Não é possível alterar o papel do proprietário da organização.");
        }

        const updated = await this.membershipRepository.updateRole({
            id:   params.membershipId,
            role: params.role,
        });

        return UpdateMemberRoleMapper.toView(updated);
    }
}

export namespace UpdateMemberRole {
    export type Params   = UpdateMemberRoleDTO;
    export type Response = UpdateMemberRoleView;
}
