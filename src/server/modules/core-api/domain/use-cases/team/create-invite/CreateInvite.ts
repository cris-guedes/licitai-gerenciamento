import { PrismaInviteRepository } from "@/server/shared/infra/repositories/invite.repository";
import { CreateInviteMapper, type CreateInviteView } from "./dtos/CreateInviteView";
import type { CreateInviteDTO } from "./dtos/CreateInviteDTOs";

export class CreateInvite {
    constructor(
        private readonly inviteRepository: PrismaInviteRepository,
    ) {}

    async execute(params: CreateInvite.Params): Promise<CreateInvite.Response> {
        const token     = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await this.inviteRepository.create({
            token,
            email:          params.email,
            role:           params.role,
            organizationId: params.organizationId,
            companyId:      params.companyId,
            createdById:    params.createdById,
            expiresAt,
        });

        const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const inviteUrl = `${appUrl}/invite/${token}`;

        return CreateInviteMapper.toView(inviteUrl);
    }
}

export namespace CreateInvite {
    export type Params   = CreateInviteDTO;
    export type Response = CreateInviteView;
}
