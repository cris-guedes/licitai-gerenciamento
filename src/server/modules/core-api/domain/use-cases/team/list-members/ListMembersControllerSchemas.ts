import { z } from "zod";

export const ListMembersQuerySchema = z.object({
    organizationId: z.string().describe("ID da organizacao"),
});

export const ListMemberItemSchema = z.object({
    membershipId: z.string().describe("ID da membership"),
    userId:       z.string().describe("ID do usuario"),
    name:         z.string().describe("Nome do membro"),
    email:        z.string().describe("Email do membro"),
    role:         z.string().describe("Papel do membro (OWNER, ADMIN, MEMBER)"),
    createdAt:    z.date().describe("Data de entrada na organizacao"),
});

export const ListMembersResponseSchema = z.object({
    members: z.array(ListMemberItemSchema).describe("Lista de membros da organizacao"),
});

export namespace ListMembersControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().describe("Bearer token do usuario autenticado"),
    });

    export const Body   = z.null();
    export const Query  = ListMembersQuerySchema;
    export const Params = z.null();

    export const Response = ListMembersResponseSchema;

    export type Input = z.infer<typeof ListMembersQuerySchema>;
}
