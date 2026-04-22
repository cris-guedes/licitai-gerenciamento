import { PrismaInviteRepository } from "@/server/shared/infra/repositories/invite.repository";
import { CreateInvite }           from "./CreateInvite";
import { CreateInviteController } from "./CreateInviteController";

import { UuidIdentifierProvider } from "@/server/shared/infra/providers/identifier/uuid-identifier-provider";

export function makeCreateInvite(): CreateInviteController {
    return new CreateInviteController(new CreateInvite(new PrismaInviteRepository(), new UuidIdentifierProvider()));
}
