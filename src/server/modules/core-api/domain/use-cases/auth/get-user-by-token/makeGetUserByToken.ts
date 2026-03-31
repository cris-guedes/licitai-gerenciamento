import { BetterAuthJwtProvider } from "@/server/shared/infra/providers/jwt/jwt-provider";
import { PrismaUserRepository } from "@/server/shared/infra/repositories/user.repository";
import { GetUserByToken } from "./GetUserByToken";

export function makeGetUserByToken(): GetUserByToken {
    return new GetUserByToken(
        new BetterAuthJwtProvider(),
        new PrismaUserRepository(),
    );
}
