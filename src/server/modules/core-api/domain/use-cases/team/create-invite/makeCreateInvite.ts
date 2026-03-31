import { PrismaInviteRepository } from "@/server/shared/infra/repositories/invite.repository";
import { CreateInvite }           from "./CreateInvite";
import { CreateInviteController } from "./CreateInviteController";

export function makeCreateInvite(): CreateInviteController {
    return new CreateInviteController(new CreateInvite(new PrismaInviteRepository()));
}
