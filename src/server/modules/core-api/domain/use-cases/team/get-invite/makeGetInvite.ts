import { PrismaInviteRepository } from "@/server/shared/infra/repositories/invite.repository";
import { GetInvite }              from "./GetInvite";
import { GetInviteController }    from "./GetInviteController";

export function makeGetInvite(): GetInviteController {
    return new GetInviteController(new GetInvite(new PrismaInviteRepository()));
}
