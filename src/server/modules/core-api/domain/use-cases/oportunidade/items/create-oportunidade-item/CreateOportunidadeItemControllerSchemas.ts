/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { LicitacaoWorkspaceItemSchema } from "@/server/modules/core-api/domain/use-cases/licitacao/_shared/licitacaoWorkspaceSchemas";

const nullableNumericInput = z.union([z.number(), z.string()]).nullable().optional();

export const CreateOportunidadeItemPayloadSchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa dona da oportunidade."),
    oportunidadeId: z.string().min(1).describe("ID da oportunidade que receberá o item."),
    data: z.object({
        numeroItem: nullableNumericInput.describe("Número sequencial do item no edital."),
        descricao: z.string().nullable().optional().describe("Descrição oficial do item."),
        quantidadeTotal: nullableNumericInput.describe("Quantidade total solicitada no edital."),
        valorUnitarioEstimado: nullableNumericInput.describe("Valor unitário estimado pelo edital."),
        valorTotalEstimado: nullableNumericInput.describe("Valor total estimado pelo edital."),
        unidadeMedida: z.string().nullable().optional().describe("Unidade de medida oficial do item."),
    }).describe("Dados iniciais do item da oportunidade."),
});

export const CreateOportunidadeItemResponseSchema = z.object({
    item: LicitacaoWorkspaceItemSchema.describe("Item criado no mesmo formato do workspace da oportunidade."),
});

export namespace CreateOportunidadeItemControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = CreateOportunidadeItemPayloadSchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = CreateOportunidadeItemResponseSchema;

    export type Input = z.infer<typeof Body>;
}
