import { PrismaInviteRepository }    from "@/server/shared/infra/repositories/invite.repository";
import { PrismaUserRepository }       from "@/server/shared/infra/repositories/user.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaAccountRepository }    from "@/server/shared/infra/repositories/account.repository";
import { BetterAuthHashProvider }         from "@/server/shared/infra/providers/hash/hash-provider";
import { AcceptInvite }               from "./AcceptInvite";
import { AcceptInviteController }     from "./AcceptInviteController";

export function makeAcceptInvite(): AcceptInviteController {
    return new AcceptInviteController(new AcceptInvite(
        new PrismaInviteRepository(),
        new PrismaUserRepository(),
        new PrismaMembershipRepository(),
        new PrismaAccountRepository(),
        new BetterAuthHashProvider(),
    ));
}
