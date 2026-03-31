import type { HashProvider }              from "@/server/shared/infra/providers/hash/hash-provider";
import { PrismaUserRepository }            from "@/server/shared/infra/repositories/user.repository";
import { PrismaMembershipRepository }      from "@/server/shared/infra/repositories/membership.repository";
import { PrismaAccountRepository }         from "@/server/shared/infra/repositories/account.repository";
import { CreateMemberMapper, type CreateMemberView } from "./dtos/CreateMemberView";
import type { CreateMemberDTO }            from "./dtos/CreateMemberDTOs";

export class CreateMember {
    constructor(
        private readonly userRepository:       PrismaUserRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
        private readonly accountRepository:    PrismaAccountRepository,
        private readonly hashProvider:         HashProvider,
    ) {}

    async execute(params: CreateMember.Params): Promise<CreateMember.Response> {
        const existing = await this.userRepository.findByEmail({ email: params.email });
        if (existing) {
            throw new Error(`Email ${params.email} já está em uso.`);
        }

        const hashedPassword = await this.hashProvider.hash(params.password);

        const user = await this.userRepository.create({
            name:          params.name,
            email:         params.email,
            password:      hashedPassword,
            emailVerified: false,
        });
        await this.accountRepository.createCredentialAccount({
            userId:         user.id,
            hashedPassword: hashedPassword,
        });

        const membership = await this.membershipRepository.createMember({
            userId:         user.id,
            organizationId: params.organizationId,
            companyId:      params.companyId,
            role:           params.role,
        });

        return CreateMemberMapper.toView(membership.id);
    }
}

export namespace CreateMember {
    export type Params   = CreateMemberDTO;
    export type Response = CreateMemberView;
}
