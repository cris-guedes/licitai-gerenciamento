import { z } from "zod";

export const LocalEntregaResponseSchema = z.object({
    id: z.string(),
    empenhoId: z.string(),
    orgaoNome: z.string().nullable(),
    logradouro: z.string(),
    numero: z.string().nullable(),
    complemento: z.string().nullable(),
    bairro: z.string().nullable(),
    cidade: z.string().nullable(),
    estado: z.string().nullable(),
    cep: z.string().nullable(),
    contatoNome: z.string().nullable(),
    contatoTelefone: z.string().nullable(),
    contatoEmail: z.string().nullable(),
    observacoes: z.string().nullable(),
});

export const CreateLocalEntregaInputSchema = z.object({
    companyId: z.string().describe("ID da empresa"),
    contratoId: z.string().describe("ID do Contrato"),
    empenhoId: z.string().describe("ID do Empenho"),
    orgaoNome: z.string().optional(),
    logradouro: z.string(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    cep: z.string().optional(),
    contatoNome: z.string().optional(),
    contatoTelefone: z.string().optional(),
    contatoEmail: z.string().optional(),
    observacoes: z.string().optional(),
});

export namespace CreateLocalEntregaControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body   = CreateLocalEntregaInputSchema;
    export const Query  = z.null();
    export const Params = z.null();

    export const Response = LocalEntregaResponseSchema;

    export type Input = z.infer<typeof Body>;
}
