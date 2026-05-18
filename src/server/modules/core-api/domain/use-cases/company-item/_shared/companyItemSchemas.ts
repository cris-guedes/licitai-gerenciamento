import { z } from "zod";

export const CompanyItemSchema = z.object({
    id: z.string().describe("ID do item da empresa"),
    companyId: z.string().describe("ID da empresa dona do item"),
    codigo: z.string().describe("Codigo interno do item"),
    descricao: z.string().describe("Descricao principal do item"),
    marca: z.string().nullable().describe("Marca comercial do item, quando informada"),
    unidadeMedida: z.string().describe("Unidade de medida operacional do item"),
    imageUrl: z.string().url().nullable().describe("Imagem principal do item para exibição no catálogo"),
    precoReferencia: z.number().nullable().describe("Preço de referência do item"),
    ativo: z.boolean().describe("Indica se o item pode ser usado nos fluxos operacionais"),
    createdAt: z.date().describe("Data de criacao do item"),
    updatedAt: z.date().describe("Data da ultima atualizacao do item"),
});

export const CompanyItemWritableFieldsSchema = z.object({
    codigo: z.string().min(1).describe("Codigo interno do item"),
    descricao: z.string().min(1).describe("Descricao principal do item"),
    marca: z.string().nullable().optional().describe("Marca comercial do item, quando informada"),
    unidadeMedida: z.string().min(1).describe("Unidade de medida operacional do item"),
    imageUrl: z.string().url().nullable().optional().describe("Imagem principal do item para exibição no catálogo"),
    precoReferencia: z.number().nullable().optional().describe("Preço de referência do item"),
    ativo: z.boolean().optional().describe("Permite ativar ou inativar o item"),
});
