import type { RouteConfig }         from "../adapters/http-adapter";
import { authMiddleware }            from "../middlewares/auth";
import { makeListMembers }           from "../../domain/use-cases/team/list-members/makeListMembers";
import { makeCreateMember }          from "../../domain/use-cases/team/create-member/makeCreateMember";
import { makeCreateInvite }          from "../../domain/use-cases/team/create-invite/makeCreateInvite";
import { makeGetInvite }             from "../../domain/use-cases/team/get-invite/makeGetInvite";
import { makeAcceptInvite }          from "../../domain/use-cases/team/accept-invite/makeAcceptInvite";
import { makeUpdateMemberRole }      from "../../domain/use-cases/team/update-member-role/makeUpdateMemberRole";
import { makeRemoveMember }          from "../../domain/use-cases/team/remove-member/makeRemoveMember";

export const teamRoutes: Record<string, RouteConfig> = {
    "team/list-members":       { make: makeListMembers,      method: "GET",  preHandlers: [authMiddleware] },
    "team/create-member":      { make: makeCreateMember,     method: "POST", preHandlers: [authMiddleware] },
    "team/create-invite":      { make: makeCreateInvite,     method: "POST", preHandlers: [authMiddleware] },
    "team/get-invite":         { make: makeGetInvite,        method: "GET"  },
    "team/accept-invite":      { make: makeAcceptInvite,     method: "POST" },
    "team/update-member-role": { make: makeUpdateMemberRole, method: "POST", preHandlers: [authMiddleware] },
    "team/remove-member":      { make: makeRemoveMember,     method: "POST", preHandlers: [authMiddleware] },
};
