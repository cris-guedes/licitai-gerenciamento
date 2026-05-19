import { z } from "zod";

const nullableDecimalString = z.string().nullable();

export const ContratoCompanyItemSchema = z.object({
    id: z.string().describe("ID do item interno da empresa."),
    companyId: z.string().describe("ID da empresa dona do item interno."),
    codigo: z.string().describe("Código interno do item."),
    descricao: z.string().describe("Descrição do item interno."),
    marca: z.string().nullable().describe("Marca comercial cadastrada."),
    unidadeMedida: z.string().describe("Unidade de medida operacional."),
    imageUrl: z.string().nullable().describe("URL da imagem do item interno."),
    precoReferencia: z.union([z.string(), z.number()]).nullable().describe("Preço de referência cadastrado."),
    ativo: z.boolean().describe("Indica se o item interno está ativo."),
    createdAt: z.union([z.string(), z.date()]).describe("Data de criação do item interno."),
    updatedAt: z.union([z.string(), z.date()]).describe("Data de atualização do item interno."),
}).describe("Resumo do item interno vinculado ao item do contrato.");

export const ContratoItemSchema = z.object({
    id: z.string().describe("ID do item do contrato."),
    oportunidadeItemId: z.string().describe("ID do item da oportunidade de origem."),
    itemNumero: z.number().nullable().describe("Número do item no edital."),
    descricao: z.string().describe("Descrição oficial do item."),
    unidadeMedida: z.string().nullable().describe("Unidade de medida oficial."),
    lote: z.string().nullable().describe("Lote do item, quando houver."),
    tipoItem: z.string().nullable().describe("Tipo oficial do item."),
    quantidadeContratada: nullableDecimalString.describe("Quantidade contratada."),
    quantidadeEmpenhada: z.string().describe("Quantidade já empenhada."),
    quantidadeEntregue: z.string().describe("Quantidade já entregue."),
    quantidadePaga: z.string().describe("Quantidade já paga."),
    valorUnitario: nullableDecimalString.describe("Valor unitário contratado."),
    valorTotal: nullableDecimalString.describe("Valor total contratado."),
    valorReferencia: nullableDecimalString.optional().describe("Valor unitário de referência do edital."),
    marca: z.string().nullable().describe("Marca ofertada ou herdada do item interno."),
    modelo: z.string().nullable().describe("Modelo ofertado."),
    garantia: z.string().nullable().describe("Garantia ofertada."),
    companyItem: ContratoCompanyItemSchema.nullable().describe("Item interno vinculado, quando houver."),
}).passthrough().describe("Item do contrato normalizado para o workspace.");

export const ContratoItemMutationResponseSchema = z.object({
    item: ContratoItemSchema.describe("Item do contrato criado ou atualizado."),
}).describe("Resposta de mutação de item do contrato.");
