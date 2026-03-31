import { z } from "zod";

export const AcceptInviteInputSchema = z.object({
    token:    z.string().describe("Token do convite"),
    name:     z.string().describe("Nome do usuario que esta aceitando o convite"),
    password: z.string().min(6).describe("Senha para a nova conta"),
});

export const AcceptInviteResponseSchema = z.object({
    email: z.string().describe("Email do usuario que aceitou o convite"),
});

export namespace AcceptInviteControllerSchemas {
    export const Headers = z.object({}).optional();

    export const Body   = AcceptInviteInputSchema;
    export const Query  = z.null();
    export const Params = z.null();

    export const Response = AcceptInviteResponseSchema;

    export type Input = z.infer<typeof AcceptInviteInputSchema>;
}
