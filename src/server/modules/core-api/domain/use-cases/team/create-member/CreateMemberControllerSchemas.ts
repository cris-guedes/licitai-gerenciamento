import { z } from "zod";

export const CreateMemberInputSchema = z.object({
    name:           z.string().describe("Nome do novo membro"),
    email:          z.string().email().describe("Email do novo membro"),
    password:       z.string().min(6).describe("Senha do novo membro"),
    role:           z.enum(["ADMIN", "MEMBER"]).describe("Papel do membro na organizacao"),
    organizationId: z.string().describe("ID da organizacao"),
    companyId:      z.string().describe("ID da empresa"),
});

export const CreateMemberResponseSchema = z.object({
    membershipId: z.string().describe("ID da membership criada"),
});

export namespace CreateMemberControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().describe("Bearer token do usuario autenticado"),
    });

    export const Body   = CreateMemberInputSchema;
    export const Query  = z.null();
    export const Params = z.null();

    export const Response = CreateMemberResponseSchema;

    export type Input = z.infer<typeof CreateMemberInputSchema>;
}
