import type { HashProvider }              from "@/server/shared/infra/providers/auth/hash-provider";
import { PrismaInviteRepository }          from "@/server/shared/infra/repositories/invite.repository";
import { PrismaUserRepository }            from "@/server/shared/infra/repositories/user.repository";
import { PrismaMembershipRepository }      from "@/server/shared/infra/repositories/membership.repository";
import { PrismaAccountRepository }         from "@/server/shared/infra/repositories/account.repository";
import { AcceptInviteMapper, type AcceptInviteView } from "./dtos/AcceptInviteView";
import type { AcceptInviteDTO }            from "./dtos/AcceptInviteDTOs";

export class AcceptInvite {
    constructor(
        private readonly inviteRepository:     PrismaInviteRepository,
        private readonly userRepository:       PrismaUserRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
        private readonly accountRepository:    PrismaAccountRepository,
        private readonly hashProvider:         HashProvider,
    ) {}

    async execute(params: AcceptInvite.Params): Promise<AcceptInvite.Response> {
        const invite = await this.inviteRepository.findByToken({ token: params.token });

        if (!invite || invite.expiresAt < new Date() || invite.usedAt !== null) {
            throw new Error("Convite inválido ou expirado");
        }

        let user = await this.userRepository.findByEmail({ email: invite.email });

        if (!user) {
            const hashedPassword = await this.hashProvider.hash(params.password);
            user = await this.userRepository.create({
                name:          params.name,
                email:         invite.email,
                password:      hashedPassword,
                emailVerified: false,
            });
            await this.accountRepository.createCredentialAccount({
                userId:         user.id,
                hashedPassword: hashedPassword,
            });
        }

        await this.membershipRepository.createMember({
            userId:         user.id,
            organizationId: invite.organizationId,
            companyId:      invite.companyId,
            role:           invite.role as "ADMIN" | "MEMBER",
        });

        await this.inviteRepository.markUsed({ token: params.token });

        return AcceptInviteMapper.toView(invite.email);
    }
}

export namespace AcceptInvite {
    export type Params   = AcceptInviteDTO;
    export type Response = AcceptInviteView;
}
