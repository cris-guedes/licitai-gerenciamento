import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { ListMembers }                 from "./ListMembers";
import { ListMembersController }       from "./ListMembersController";

export function makeListMembers(): ListMembersController {
    return new ListMembersController(new ListMembers(new PrismaMembershipRepository()));
}
