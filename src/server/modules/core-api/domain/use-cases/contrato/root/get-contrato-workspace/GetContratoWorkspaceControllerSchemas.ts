import { z } from "zod";

// We keep the inner tree flexible because it includes nested Prisma relations,
// but always wrap it in `data` for the client workspace pages.
export const ContratoWorkspaceResponseSchema = z.object({
    data: z.any(),
}).describe("Árvore completa do workspace do contrato");

export namespace GetContratoWorkspaceControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body   = z.null();
    export const Query  = z.object({
        companyId: z.string().describe("ID da empresa"),
        contratoId: z.string().describe("ID do Contrato"),
    });
    export const Params = z.null();

    export const Response = ContratoWorkspaceResponseSchema;

    export type Input = z.infer<typeof Query>;
}
