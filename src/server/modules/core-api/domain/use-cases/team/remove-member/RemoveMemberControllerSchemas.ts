import { z } from "zod";

export const RemoveMemberInputSchema = z.object({
    membershipId: z.string().describe("ID da membership a ser removida"),
});

export const RemoveMemberResponseSchema = z.object({
    success: z.literal(true).describe("Indica que o membro foi removido com sucesso"),
});

export namespace RemoveMemberControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().describe("Bearer token do usuario autenticado"),
    });

    export const Body   = RemoveMemberInputSchema;
    export const Query  = z.null();
    export const Params = z.null();

    export const Response = RemoveMemberResponseSchema;

    export type Input = z.infer<typeof RemoveMemberInputSchema>;
}
