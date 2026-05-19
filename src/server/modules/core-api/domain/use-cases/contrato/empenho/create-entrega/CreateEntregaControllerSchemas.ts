/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";

export const EntregaResponseSchema = z.object({
    id: z.string().describe("ID da entrega criada."),
    empenhoItemId: z.string().describe("ID do item do empenho entregue."),
    localEntregaId: z.string().nullable().optional().describe("ID do local de entrega vinculado."),
    quantidadeEntregue: z.union([z.string(), z.number()]).describe("Quantidade reservada para entrega."),
    dataEntrega: z.union([z.string(), z.date()]).nullable().optional().describe("Data em que a entrega foi concluída."),
    status: z.string().describe("Status atual da entrega no pipeline."),
    observacao: z.string().nullable().describe("Observações registradas para a entrega."),
});

export const CreateEntregaItemSchema = z.object({
    empenhoItemId: z.string().describe("ID do item do empenho."),
    quantidade: z.coerce.number().positive().describe("Quantidade a entregar deste item."),
});

export const CreateEntregaInputSchema = z.object({
    companyId: z.string().describe("ID da empresa"),
    contratoId: z.string().describe("ID do Contrato"),
    empenhoId: z.string().describe("ID do Empenho"),
    empenhoItemId: z.string().optional().describe("ID do item do empenho para criação simples."),
    quantidade: z.coerce.number().positive().optional().describe("Quantidade para criação simples."),
    itens: z.array(CreateEntregaItemSchema).optional().describe("Itens que serão inseridos na entrega em lote."),
    localEntregaId: z.string().optional().describe("Local de entrega previamente cadastrado."),
    dataPrevista: z.coerce.date().optional().describe("Data prevista para entrega."),
    observacoes: z.string().optional().describe("Observações gerais da entrega."),
}).refine((data) => {
    return Boolean(data.itens?.length) || Boolean(data.empenhoItemId && data.quantidade);
}, {
    message: "Informe ao menos um item para a entrega.",
});

export const CreateEntregaResponseSchema = z.object({
    entregas: z.array(EntregaResponseSchema).describe("Entregas criadas no pipeline."),
}).describe("Resposta da criação de entregas.");

export namespace CreateEntregaControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body   = CreateEntregaInputSchema;
    export const Query  = z.null();
    export const Params = z.null();

    export const Response = CreateEntregaResponseSchema;

    export type Input = z.infer<typeof Body>;
}
