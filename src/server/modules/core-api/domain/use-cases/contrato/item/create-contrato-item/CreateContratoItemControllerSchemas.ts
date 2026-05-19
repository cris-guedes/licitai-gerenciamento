/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { ContratoItemMutationResponseSchema } from "../../_shared/contratoItemSchemas";

export const CreateContratoItemInputSchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa"),
    contratoId: z.string().min(1).describe("ID do contrato"),
    oportunidadeItemId: z.string().min(1).describe("ID do item da oportunidade que será vinculado"),
    quantidadeContratada: z.coerce.number().nullable().optional().describe("Quantidade contratada"),
    valorUnitario: z.coerce.number().nullable().optional().describe("Valor unitário contratado"),
    valorTotal: z.coerce.number().nullable().optional().describe("Valor total contratado"),
});

export namespace CreateContratoItemControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body = CreateContratoItemInputSchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = ContratoItemMutationResponseSchema;

    export type Input = z.infer<typeof Body>;
}
