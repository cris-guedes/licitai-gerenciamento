import { z } from "zod";

export const EntregaResponseSchema = z.object({
    id: z.string(),
    empenhoItemId: z.string(),
    quantidadeEntregue: z.any(), // Decimal mapped to string/number
    dataEntrega: z.date().nullable().optional(),
    status: z.string(),
    observacao: z.string().nullable(),
});

export const CreateEntregaInputSchema = z.object({
    companyId: z.string(),
    contratoId: z.string().describe("ID do Contrato"),
    empenhoId: z.string().describe("ID do Empenho"),
    empenhoItemId: z.string(),
    quantidade: z.coerce.number(),
    dataPrevista: z.coerce.date().optional(),
    observacoes: z.string().optional(),
});

export namespace CreateEntregaControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body   = CreateEntregaInputSchema;
    export const Query  = z.null();
    export const Params = z.null();

    export const Response = EntregaResponseSchema;

    export type Input = z.infer<typeof Body>;
}
