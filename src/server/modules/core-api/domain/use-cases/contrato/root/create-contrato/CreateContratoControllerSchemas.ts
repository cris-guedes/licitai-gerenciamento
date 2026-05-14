import { z } from "zod";

export const CreateContratoItemSchema = z.object({
    oportunidadeItemId: z.string().describe("ID do OportunidadeItem"),
    quantidadeContratada: z.coerce.number().optional().describe("Quantidade do item fechada no contrato"),
    valorUnitario: z.coerce.number().optional().describe("Valor unitário negociado"),
    valorTotal: z.coerce.number().optional().describe("Valor total do item"),
});

export const CreateContratoInputSchema = z.object({
    companyId: z.string().describe("ID da empresa (passado pelo frontend)"),
    oportunidadeId: z.string().min(1).describe("ID da Oportunidade de origem"),
    
    numeroContrato: z.string().optional().describe("Número do contrato (ex: 01/2025)"),
    anoContrato: z.coerce.number().optional().describe("Ano do contrato"),
    processo: z.string().optional().describe("Número do Processo Administrativo"),
    tipoContrato: z.string().optional().describe("Tipo: contrato, ata_registro_precos, empenho_direto"),
    objetoContrato: z.string().optional().describe("Objeto do contrato"),

    dataAssinatura: z.string().optional().describe("Data de assinatura"),
    dataVigenciaInicio: z.string().optional().describe("Início da vigência"),
    dataVigenciaFim: z.string().optional().describe("Fim da vigência"),

    fornecedorCnpjCpf: z.string().optional().describe("CNPJ da nossa empresa no contrato"),
    fornecedorNome: z.string().optional().describe("Razão Social da nossa empresa"),

    valorInicial: z.coerce.number().optional().describe("Valor inicial do contrato"),
    valorGlobal: z.coerce.number().optional().describe("Valor global do contrato"),
    valorTotal: z.coerce.number().optional().describe("Valor total (alias para global)"),
    status: z.enum(["RASCUNHO", "VIGENTE", "ENCERRADO", "RESCINDIDO", "CANCELADO"]).optional().describe("Status do contrato"),

    itens: z.array(CreateContratoItemSchema).describe("Lista de itens vinculados a este contrato"),
});

export const ContratoResponseSchema = z.object({
    id: z.string().describe("ID do Contrato"),
    oportunidadeId: z.string().describe("ID da Oportunidade"),
    companyId: z.string().describe("ID da empresa"),
    numeroContrato: z.string().nullable().describe("Número do contrato"),
    anoContrato: z.number().nullable().optional(),
    processo: z.string().nullable().optional(),
    objetoContrato: z.string().nullable().optional(),
    tipoContrato: z.string().nullable().optional(),
    fornecedorCnpjCpf: z.string().nullable().optional(),
    fornecedorNome: z.string().nullable().optional(),
    valorInicial: z.string().nullable().optional(),
    valorGlobal: z.string().nullable().optional(),
    valorTotal: z.string().nullable().optional(),
    dataAssinatura: z.string().nullable().optional(),
    dataVigenciaInicio: z.string().nullable().optional(),
    dataVigenciaFim: z.string().nullable().optional(),
    status: z.string().describe("Status do contrato"),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    oportunidade: z.any().optional(),
});

export namespace CreateContratoControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body   = CreateContratoInputSchema;
    export const Query  = z.null();
    export const Params = z.null();

    export const Response = ContratoResponseSchema;

    export type Input = z.infer<typeof CreateContratoInputSchema>;
}
