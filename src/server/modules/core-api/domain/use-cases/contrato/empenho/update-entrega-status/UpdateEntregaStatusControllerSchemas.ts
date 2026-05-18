import { z } from "zod";
import { EntregaResponseSchema } from "../create-entrega/CreateEntregaControllerSchemas";

export const UpdateEntregaStatusInputSchema = z.object({
    companyId: z.string(),
    contratoId: z.string().describe("ID do Contrato"),
    empenhoId: z.string().describe("ID do Empenho"),
    entregaId: z.string().describe("ID da Entrega"),
    status: z.enum(["PENDENTE", "ENTREGUE", "ACEITE_PROVISORIO", "ACEITE_DEFINITIVO", "PAGO", "REJEITADO"]).describe("Novo status da entrega"),
    dataEntrega: z.coerce.date().optional(),
    observacoes: z.string().optional(),
});

export namespace UpdateEntregaStatusControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body   = UpdateEntregaStatusInputSchema;
    export const Query  = z.null();
    export const Params = z.null();

    export const Response = EntregaResponseSchema;

    export type Input = z.infer<typeof Body>;
}
