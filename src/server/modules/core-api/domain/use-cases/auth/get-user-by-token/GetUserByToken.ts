import { UnauthorizedError } from "@/server/shared/errors/unauthorized-error";
import { JwtProvider } from "@/server/shared/infra/providers/auth/jwt-provider";
import { PrismaUserRepository } from "@/server/shared/infra/repositories/user.repository";

export class GetUserByToken {
    constructor(
        private readonly jwtProvider: JwtProvider,
        private readonly userRepository: PrismaUserRepository,
    ) {}

    async execute({ token }: GetUserByToken.Params): Promise<GetUserByToken.Response> {
        const identifier = await this.jwtProvider.getUserIdentifier(token);
        if (!identifier) throw new UnauthorizedError();

        const user = await this.userRepository.findByEmail({ email: identifier.email });
        if (!user) throw new UnauthorizedError();

        return user;
    }
}

export namespace GetUserByToken {
    export type Params   = { token: string };
    export type Response = PrismaUserRepository.UserResponse;
}
