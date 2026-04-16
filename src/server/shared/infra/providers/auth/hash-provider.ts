import { hashPassword, verifyPassword } from "better-auth/crypto";

export interface HashProvider {
    hash(plain: string): Promise<string>;
    compare(plain: string, hashed: string): Promise<boolean>;
}

/**
 * Uses better-auth's native scrypt hashing, so hashes produced here
 * are compatible with passwords verified by better-auth's sign-in flow.
 */
export class BetterAuthHashProvider implements HashProvider {
    async hash(plain: string): Promise<string> {
        return hashPassword(plain);
    }

    async compare(plain: string, hashed: string): Promise<boolean> {
        return verifyPassword({ hash: hashed, password: plain });
    }
}
