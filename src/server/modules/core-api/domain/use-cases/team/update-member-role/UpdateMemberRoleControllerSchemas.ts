import { z } from "zod";

export const UpdateMemberRoleInputSchema = z.object({
    membershipId: z.string().describe("ID da membership a ser atualizada"),
    role:         z.enum(["ADMIN", "MEMBER"]).describe("Novo papel do membro"),
});

export const UpdateMemberRoleResponseSchema = z.object({
    membershipId: z.string().describe("ID da membership atualizada"),
    role:         z.string().describe("Novo papel atribuido"),
});

export namespace UpdateMemberRoleControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().describe("Bearer token do usuario autenticado"),
    });

    export const Body   = UpdateMemberRoleInputSchema;
    export const Query  = z.null();
    export const Params = z.null();

    export const Response = UpdateMemberRoleResponseSchema;

    export type Input = z.infer<typeof UpdateMemberRoleInputSchema>;
}
