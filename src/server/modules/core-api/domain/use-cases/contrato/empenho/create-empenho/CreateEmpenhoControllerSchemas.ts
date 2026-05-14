import { z } from "zod";

export const CreateEmpenhoItemSchema = z.object({
    contratoItemId: z.string().describe("ID do ContratoItem"),
    quantidade: z.number().describe("Quantidade sendo empenhada"),
    valorUnitario: z.number().optional().describe("Valor unitário (caso diferente do contrato)"),
    valorTotal: z.number().optional().describe("Valor total desta linha de empenho"),
});

export const CreateEmpenhoInputSchema = z.object({
    companyId: z.string().describe("ID da empresa (passado pelo frontend)"),
    contratoId: z.string().describe("ID do Contrato"),
    numeroEmpenho: z.string().describe("Número da nota de empenho"),
    tipoEmpenho: z.string().optional().describe("Ex: ordinario, estimativo, global"),
    valor: z.number().describe("Valor total do empenho"),
    dataEmissao: z.string().optional().describe("Data de emissão da nota de empenho"),
    
    orgaoCnpj: z.string().optional().describe("CNPJ do órgão emissor"),
    orgaoNome: z.string().optional().describe("Nome do órgão emissor"),
    orgaoUnidadeNome: z.string().optional().describe("Unidade/Secretaria"),
    
    observacao: z.string().optional().describe("Observações gerais"),
    status: z.enum(["ATIVO", "CANCELADO", "UTILIZADO"]).optional().describe("Status do empenho"),

    itens: z.array(CreateEmpenhoItemSchema).describe("Itens vinculados ao empenho"),
});

export const EmpenhoResponseSchema = z.object({
    id: z.string().describe("ID do Empenho gerado"),
    numeroEmpenho: z.string().describe("Número do Empenho"),
    valor: z.number().describe("Valor do empenho"),
    status: z.string().describe("Status do empenho"),
    // Adicione mais campos conforme a necessidade do Client
});

export namespace CreateEmpenhoControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body   = CreateEmpenhoInputSchema;
    export const Query  = z.null();
    export const Params = z.null();

    export const Response = EmpenhoResponseSchema;

    export type Input = z.infer<typeof CreateEmpenhoInputSchema>;
}
