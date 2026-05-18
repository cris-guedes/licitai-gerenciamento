/* eslint-disable @typescript-eslint/no-namespace */
import { z } from "zod";

const KnownOrgaoSchema = z.object({
    id: z.string().describe("ID interno do órgão público previamente cadastrado."),
    cnpj: z.string().describe("CNPJ conhecido do órgão público."),
    nome: z.string().describe("Razão social ou nome principal do órgão público."),
    codigoUnidade: z.string().describe("Código da unidade gestora do órgão, quando disponível."),
    nomeUnidade: z.string().describe("Nome da unidade gestora do órgão, quando disponível."),
    municipio: z.string().describe("Município associado ao órgão."),
    uf: z.string().describe("UF associada ao órgão."),
    esfera: z.string().describe("Esfera normalizada para reaproveitamento no cadastro."),
    poder: z.string().describe("Poder normalizado para reaproveitamento no cadastro."),
});

const ListKnownOrgaosQuerySchema = z.object({
    companyId: z.string().min(1).describe("ID da empresa dona dos órgãos já utilizados em licitações anteriores."),
});

export namespace ListKnownOrgaosControllerSchemas {
    export const Headers = z.object({
        authorization: z.string().optional().describe("Bearer token do usuário autenticado."),
    }).optional();

    export const Body = z.null();
    export const Query = ListKnownOrgaosQuerySchema;
    export const Params = z.null();
    export const Response = z.object({
        orgaos: z.array(KnownOrgaoSchema).describe("Órgãos públicos já cadastrados e reutilizáveis no formulário."),
    });

    export type Input = z.infer<typeof ListKnownOrgaosQuerySchema>;
}
