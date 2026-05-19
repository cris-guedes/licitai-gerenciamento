/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";

export const DeleteContratoItemInputSchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa"),
    contratoId: z.string().min(1).describe("ID do contrato"),
    contratoItemId: z.string().min(1).describe("ID do item do contrato"),
});

export namespace DeleteContratoItemControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body = DeleteContratoItemInputSchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = z.object({
        contratoItemId: z.string(),
    });

    export type Input = z.infer<typeof Body>;
}
