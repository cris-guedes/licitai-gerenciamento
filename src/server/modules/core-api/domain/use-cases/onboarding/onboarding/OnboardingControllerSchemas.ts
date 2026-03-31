import { z } from "zod";

export const OnboardingInputSchema = z.object({
    cnpj:                    z.string().describe("CNPJ da empresa (apenas numeros, 14 digitos)"),
    razao_social:            z.string().describe("Razao social da empresa"),
    nome_fantasia:           z.string().nullable().optional().describe("Nome fantasia"),
    situacao_cadastral:      z.string().optional().describe("Situacao cadastral (ex: ATIVA, BAIXADA)"),
    data_situacao_cadastral: z.string().optional().describe("Data da situacao cadastral"),
    data_abertura:           z.string().optional().describe("Data de abertura (YYYY-MM-DD)"),
    porte:                   z.string().optional().describe("Porte da empresa"),
    natureza_juridica:       z.string().optional().describe("Natureza juridica"),
    cnae_fiscal:             z.number().optional().describe("Codigo CNAE fiscal principal"),
    cnae_fiscal_descricao:   z.string().optional().describe("Descricao do CNAE fiscal principal"),
    cnaes_secundarios:       z.array(z.object({
        codigo:   z.number().describe("Codigo CNAE secundario"),
        descricao: z.string().describe("Descricao do CNAE secundario"),
    })).optional().describe("CNAEs secundarios"),
    logradouro:              z.string().optional(),
    numero:                  z.string().optional(),
    complemento:             z.string().nullable().optional(),
    bairro:                  z.string().optional(),
    municipio:               z.string().optional(),
    uf:                      z.string().optional(),
    cep:                     z.string().optional(),
    telefone_1:              z.string().nullable().optional(),
    email_empresa:           z.string().nullable().optional(),
    capital_social:          z.number().optional().describe("Capital social em reais"),
    opcao_pelo_simples:      z.boolean().nullable().optional(),
    opcao_pelo_mei:          z.boolean().nullable().optional(),
});

export const OnboardingResponseSchema = z.object({
    companyId:      z.string().describe("ID da empresa criada"),
    organizationId: z.string().describe("ID da organizacao criada"),
});

export namespace OnboardingControllerSchemas {
    export const Headers = z.object({
        "authorization": z.string().describe("Bearer token do usuario autenticado"),
    });

    export const Body   = OnboardingInputSchema;
    export const Query  = z.null();
    export const Params = z.null();

    export const Response = OnboardingResponseSchema;

    export type Input = z.infer<typeof OnboardingInputSchema>;
}
