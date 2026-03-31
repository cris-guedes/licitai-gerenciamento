import type { RouteConfig } from "../adapters/http-adapter";
import { makeRegisterUser } from "../../domain/use-cases/auth/register-user/makeRegisterUser";
import { makeFetchUser } from "../../domain/use-cases/auth/fetch-user/makeFetchUser";
import { makeUpdateUser } from "../../domain/use-cases/auth/update-user/makeUpdateUser";
import { makeDeleteUser } from "../../domain/use-cases/auth/delete-user/makeDeleteUser";

export const authRoutes: Record<string, RouteConfig> = {
    "register-user": { make: makeRegisterUser, method: "POST" },
    "fetch-user":    { make: makeFetchUser,    method: "GET"  },
    "update-user":   { make: makeUpdateUser,   method: "POST" },
    "delete-user":   { make: makeDeleteUser,   method: "POST" },
};
