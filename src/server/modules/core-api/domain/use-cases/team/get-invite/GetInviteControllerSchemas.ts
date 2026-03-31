import { z } from "zod";

export const GetInviteQuerySchema = z.object({
    token: z.string().describe("Token do convite"),
});

export const GetInviteResponseSchema = z.object({
    orgName:     z.string().describe("Nome da organizacao que enviou o convite"),
    companyName: z.string().describe("Nome da empresa"),
    email:       z.string().describe("Email do convidado"),
    role:        z.string().describe("Papel oferecido ao convidado"),
    expiresAt:   z.date().describe("Data de expiracao do convite"),
});

export namespace GetInviteControllerSchemas {
    export const Headers = z.object({}).optional();

    export const Body   = z.null();
    export const Query  = GetInviteQuerySchema;
    export const Params = z.null();

    export const Response = GetInviteResponseSchema;

    export type Input = z.infer<typeof GetInviteQuerySchema>;
}
