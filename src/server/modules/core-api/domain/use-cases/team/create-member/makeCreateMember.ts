import { PrismaUserRepository }       from "@/server/shared/infra/repositories/user.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaAccountRepository }    from "@/server/shared/infra/repositories/account.repository";
import { BetterAuthHashProvider }         from "@/server/shared/infra/providers/hash/hash-provider";
import { CreateMember }               from "./CreateMember";
import { CreateMemberController }     from "./CreateMemberController";

export function makeCreateMember(): CreateMemberController {
    return new CreateMemberController(new CreateMember(
        new PrismaUserRepository(),
        new PrismaMembershipRepository(),
        new PrismaAccountRepository(),
        new BetterAuthHashProvider(),
    ));
}
