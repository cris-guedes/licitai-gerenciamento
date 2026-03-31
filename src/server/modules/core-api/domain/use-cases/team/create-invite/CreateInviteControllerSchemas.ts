import { z } from "zod";

export const CreateInviteInputSchema = z.object({
    email:          z.string().email().describe("Email do convidado"),
    role:           z.enum(["ADMIN", "MEMBER"]).describe("Papel do convidado na organizacao"),
    organizationId: z.string().describe("ID da organizacao"),
    companyId:      z.string().describe("ID da empresa"),
});

export const CreateInviteResponseSchema = z.object({
    inviteUrl: z.string().describe("URL do convite para ser enviado ao convidado"),
});

export namespace CreateInviteControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().describe("Bearer token do usuario autenticado"),
    });

    export const Body   = CreateInviteInputSchema;
    export const Query  = z.null();
    export const Params = z.null();

    export const Response = CreateInviteResponseSchema;

    export type Input = z.infer<typeof CreateInviteInputSchema>;
}
