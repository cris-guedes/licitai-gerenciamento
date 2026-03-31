import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { RemoveMember }               from "./RemoveMember";
import { RemoveMemberController }     from "./RemoveMemberController";

export function makeRemoveMember(): RemoveMemberController {
    return new RemoveMemberController(new RemoveMember(new PrismaMembershipRepository()));
}
