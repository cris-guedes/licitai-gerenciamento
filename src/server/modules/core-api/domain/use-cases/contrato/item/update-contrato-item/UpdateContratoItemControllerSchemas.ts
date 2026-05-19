/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { ContratoItemMutationResponseSchema } from "../../_shared/contratoItemSchemas";

export const UpdateContratoItemInputSchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa"),
    contratoId: z.string().min(1).describe("ID do contrato"),
    contratoItemId: z.string().min(1).describe("ID do item do contrato"),
    quantidadeContratada: z.coerce.number().nullable().optional().describe("Quantidade contratada"),
    valorUnitario: z.coerce.number().nullable().optional().describe("Valor unitário contratado"),
    valorTotal: z.coerce.number().nullable().optional().describe("Valor total contratado"),
});

export namespace UpdateContratoItemControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body = UpdateContratoItemInputSchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = ContratoItemMutationResponseSchema;

    export type Input = z.infer<typeof Body>;
}
