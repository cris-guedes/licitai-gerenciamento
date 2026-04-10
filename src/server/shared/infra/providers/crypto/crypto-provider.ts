import { randomUUID } from "crypto";

export class CryptoProvider {
    uniqueId(): string {
        return randomUUID();
    }
}

export namespace CryptoProvider { export type Contract = CryptoProvider; }
