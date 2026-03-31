import { auth } from "@/main/auth/auth";

export interface JwtProvider {
    getUserIdentifier(token: string): Promise<{ email: string } | null>;
}

export class BetterAuthJwtProvider implements JwtProvider {
    async getUserIdentifier(token: string): Promise<{ email: string } | null> {
        const headers = new Headers();
        headers.set("Authorization", `Bearer ${token}`);
        const session = await auth.api.getSession({ headers });
        if (!session) return null;
        return { email: session.user.email };
    }
}
