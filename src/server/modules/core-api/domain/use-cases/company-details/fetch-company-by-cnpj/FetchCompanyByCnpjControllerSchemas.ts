import { z } from "zod";

export const FetchCompanyByCnpjInputSchema = z.object({
    cnpj: z
        .string()
        .describe("CNPJ da empresa (apenas números, 14 dígitos)"),
});

export const CnaeSecundarioSchema = z.object({
    codigo:   z.number().describe("Código CNAE secundário"),
    descricao: z.string().describe("Descrição do CNAE secundário"),
});

export const CompanyResponseSchema = z.object({
    cnpj:                    z.string().optional().describe("CNPJ formatado"),
    razao_social:            z.string().optional().describe("Razão social da empresa"),
    nome_fantasia:           z.string().nullable().optional().describe("Nome fantasia"),
    situacao_cadastral:      z.string().optional().describe("Situação cadastral (ex: ATIVA, BAIXADA)"),
    data_situacao_cadastral: z.string().optional().describe("Data da situação cadastral"),
    data_abertura:           z.string().optional().describe("Data de abertura (YYYY-MM-DD)"),
    porte:                   z.string().optional().describe("Porte da empresa (ex: MICRO EMPRESA, PEQUENO PORTE)"),
    natureza_juridica:       z.string().optional().describe("Natureza jurídica"),
    cnae_fiscal:             z.number().optional().describe("Código CNAE fiscal principal"),
    cnae_fiscal_descricao:   z.string().optional().describe("Descrição do CNAE fiscal principal"),
    cnaes_secundarios:       z.array(CnaeSecundarioSchema).optional().describe("CNAEs secundários"),
    logradouro:              z.string().optional(),
    numero:                  z.string().optional(),
    complemento:             z.string().nullable().optional(),
    bairro:                  z.string().optional(),
    municipio:               z.string().optional(),
    uf:                      z.string().optional(),
    cep:                     z.string().optional(),
    telefone_1:              z.string().nullable().optional(),
    email:                   z.string().nullable().optional(),
    capital_social:          z.number().optional().describe("Capital social em reais"),
    opcao_pelo_simples:      z.boolean().nullable().optional(),
    opcao_pelo_mei:          z.boolean().nullable().optional(),
});

export namespace FetchCompanyByCnpjControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().optional(),
    }).optional();

    export const Body = z.null();

    export const Query = FetchCompanyByCnpjInputSchema;

    export const Params = z.null();

    export const Response = CompanyResponseSchema;

    export type Input = z.infer<typeof FetchCompanyByCnpjInputSchema>;
}
