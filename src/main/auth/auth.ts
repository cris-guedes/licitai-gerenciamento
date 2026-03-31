import { betterAuth } from "better-auth";
import { customAuthAdapter } from "./auth.adapter";
import { bearer } from "better-auth/plugins/bearer";

export const auth = betterAuth({
    database: customAuthAdapter,
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        bearer(),
    ],
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // 5 minutes
        },
    },
});

export type Session = typeof auth.$Infer.Session;
