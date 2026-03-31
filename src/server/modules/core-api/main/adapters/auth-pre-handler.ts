import { UnauthorizedError }  from "@/server/shared/errors/unauthorized-error";
import type { GetUserByToken } from "../../domain/use-cases/auth/get-user-by-token/GetUserByToken";
import type { HttpRequest, PreHandler } from "./http-adapter";

export function makeAuthPreHandler(getUserByToken: GetUserByToken): PreHandler {
    return async (req: HttpRequest): Promise<HttpRequest> => {
        const authHeader = req.headers["authorization"];
        let token = authHeader?.replace("Bearer ", "").trim();

        // Fallback: extract better-auth session token from cookie
        if (!token) {
            const cookieHeader = req.headers["cookie"] ?? "";
            const match = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
            if (match) token = decodeURIComponent(match[1]);
        }

        if (!token) throw new UnauthorizedError();

        const user = await getUserByToken.execute({ token });
        return { ...req, user };
    };
}
