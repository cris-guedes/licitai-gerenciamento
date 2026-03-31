import { PrismaMembershipRepository }  from "@/server/shared/infra/repositories/membership.repository";
import { UpdateMemberRole }            from "./UpdateMemberRole";
import { UpdateMemberRoleController }  from "./UpdateMemberRoleController";

export function makeUpdateMemberRole(): UpdateMemberRoleController {
    return new UpdateMemberRoleController(new UpdateMemberRole(new PrismaMembershipRepository()));
}
