/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";
import { LicitacaoWorkspaceItemSchema } from "@/server/modules/core-api/domain/use-cases/licitacao/_shared/licitacaoWorkspaceSchemas";

const nullableTextField = z.string().nullable().optional();
const nullableNumericField = z.union([z.string(), z.number()]).nullable().optional();

const UpdateOportunidadeItemPricingSchema = z.object({
    quantidadeCotada: nullableNumericField.describe("Quantidade efetivamente considerada para a proposta."),
    quantidadeAdesao: nullableNumericField.describe("Quantidade adicional prevista para adesao, quando houver."),
    precoOfertaUnitario: nullableNumericField.describe("Preco unitario ofertado pela empresa."),
    custoUnitarioSnapshot: nullableNumericField.describe("Custo unitario congelado para esta oportunidade."),
    valorMinimoLance: nullableNumericField.describe("Valor minimo definido internamente para a fase de lances."),
    ofertaMarca: nullableTextField.describe("Marca efetivamente ofertada para o item."),
    ofertaModelo: nullableTextField.describe("Modelo efetivamente ofertado para o item."),
    garantiaDescricao: nullableTextField.describe("Descricao da garantia comercial prometida para o item."),
});

const UpdateOportunidadeItemDisputaSchema = z.object({
    ultimoLance: nullableNumericField.describe("Ultimo lance registrado para o item."),
    dataUltimoLance: nullableTextField.describe("Data ISO ou YYYY-MM-DD do ultimo lance informado."),
    situacaoDisputa: nullableTextField.describe("Situacao operacional resumida da disputa."),
    observacaoOperacional: nullableTextField.describe("Observacoes internas sobre a disputa do item."),
});

const UpdateOportunidadeEditalItemSchema = z.object({
    numeroItem: nullableNumericField.describe("Numero sequencial do item no edital."),
    descricao: nullableTextField.describe("Descricao oficial do item no edital."),
    tipoItem: z.enum(["MATERIAL", "SERVICO"]).nullable().optional().describe("Tipo oficial do item no edital."),
    lote: nullableTextField.describe("Identificacao do lote do item."),
    quantidadeTotal: nullableNumericField.describe("Quantidade total solicitada no edital."),
    unidadeMedida: nullableTextField.describe("Unidade de medida oficial do edital."),
    valorUnitarioEstimado: nullableNumericField.describe("Valor unitario estimado pelo edital."),
    valorTotalEstimado: nullableNumericField.describe("Valor total estimado pelo edital."),
});

const UpdateOportunidadeItemDataSchema = z.object({
    editalItem: UpdateOportunidadeEditalItemSchema.optional().describe("Dados editáveis do item oficial do edital."),
    companyItemId: nullableTextField.describe("ID do item interno da empresa vinculado ao item do edital."),
    isSelected: z.boolean().optional().describe("Indica se o item continua ativo na proposta."),
    status: z.enum(["PENDING_PRICING", "READY_FOR_BID", "IN_BIDDING", "WON", "LOST", "DISCARDED"]).optional().describe("Status operacional do item dentro da oportunidade."),
    observacaoInterna: nullableTextField.describe("Observacoes internas do time comercial para o item."),
    pricing: UpdateOportunidadeItemPricingSchema.optional().describe("Dados de precificacao do item."),
    disputa: UpdateOportunidadeItemDisputaSchema.optional().describe("Dados correntes da disputa do item."),
}).refine(data =>
    data.editalItem !== undefined
    || data.companyItemId !== undefined
    || data.isSelected !== undefined
    || data.status !== undefined
    || data.observacaoInterna !== undefined
    || data.pricing !== undefined
    || data.disputa !== undefined,
{
    message: "Informe pelo menos um dado para atualizar o item da oportunidade.",
});

const UpdateOportunidadeItemBodySchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa dona da oportunidade."),
    oportunidadeId: z.string().min(1).describe("ID da oportunidade que contem o item."),
    oportunidadeItemId: z.string().min(1).describe("ID do item operacional da oportunidade."),
    data: UpdateOportunidadeItemDataSchema.describe("Patch parcial com os dados operacionais do item da oportunidade."),
});

export namespace UpdateOportunidadeItemControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuario autenticado."),
    }).optional();

    export const Body = UpdateOportunidadeItemBodySchema;
    export const Query = z.null();
    export const Params = z.null();
    export const Response = z.object({
        item: LicitacaoWorkspaceItemSchema.describe("Item da oportunidade atualizado com o mesmo formato usado no workspace."),
    });

    export type Input = z.infer<typeof UpdateOportunidadeItemBodySchema>;
}
