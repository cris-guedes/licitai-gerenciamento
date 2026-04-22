import crypto from "crypto";
import type { IIdentifierProvider } from "@/server/modules/core-api/domain/data/IIdentifierProvider";

export class UuidIdentifierProvider implements IIdentifierProvider {
    /**
     * Gera um UUID v4 utilizando a biblioteca nativa do Node.js.
     */
    generate(): string {
        return crypto.randomUUID();
    }
}

export namespace UuidIdentifierProvider {
    /**
     * Seguindo o padrão de namespaces do projeto para providers.
     */
    export type GenerateResponse = string;
}
