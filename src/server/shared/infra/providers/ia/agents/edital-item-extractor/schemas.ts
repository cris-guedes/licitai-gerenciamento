import { z } from "zod";

export const EDITAL_ITEM_SCHEMA = z.object({
    itens: z.array(z.object({
        numero: z.number().nullable().describe("Número do item. Na falta, retorne null."),
        lote: z.string().nullable().describe("Apenas se o edital for dividido em Lotes/Grupos. Senão, null."),
        descricao: z.string().describe("Descrição do item, material ou serviço."),
        tipo: z.enum(["material", "servico"]).nullable().describe("Classificação se o item é um material ou prestação de serviço."),
        quantidade: z.number().nullable().describe("Quantidade solicitada (apenas números). Se houver ponto de milhar p.ex '240.000', retorne 240000. Se for decimal '240,50', retorne 240.50."),
        unidade: z.string().nullable().describe("Unidade de medida: UN, KG, L, PAR, CX, etc."),
        valor_unitario_estimado: z.number().nullable().describe("Preço estimado único unitário. Numeros com casas decimais usam ponto (ex: 15.50)."),
        valor_total_estimado: z.number().nullable().describe("Preço total do item (unitário x qty)."),
        catmat_catser: z.string().nullable().describe("Código e descrição CATMAT ou CATSER. Ex: '3024 - PEÇAS E ACESSÓRIOS'. Se não houver, null."),
        criterio_julgamento: z.string().nullable().describe("Critério específico de julgamento do item (Ex: Menor Preço, Maior Desconto)."),
        beneficio_tributario: z.string().nullable().describe("Informações sobre benefícios tributários (Ex: Margem de preferência)."),
        observacao: z.string().nullable().describe("Observações relevantes sobre o item."),
    })),
});
