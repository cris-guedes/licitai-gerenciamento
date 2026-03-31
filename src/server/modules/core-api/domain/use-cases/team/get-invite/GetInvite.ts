import { PrismaInviteRepository } from "@/server/shared/infra/repositories/invite.repository";
import { GetInviteMapper, type GetInviteView } from "./dtos/GetInviteView";
import type { GetInviteDTO } from "./dtos/GetInviteDTOs";

export class GetInvite {
    constructor(
        private readonly inviteRepository: PrismaInviteRepository,
    ) {}

    async execute(params: GetInvite.Params): Promise<GetInvite.Response> {
        const invite = await this.inviteRepository.findByToken({ token: params.token });

        if (!invite) {
            throw new Error("Convite inválido ou expirado");
        }

        const now = new Date();
        if (invite.expiresAt < now || invite.usedAt !== null) {
            throw new Error("Convite inválido ou expirado");
        }

        return GetInviteMapper.toView(invite);
    }
}

export namespace GetInvite {
    export type Params   = GetInviteDTO;
    export type Response = GetInviteView;
}
