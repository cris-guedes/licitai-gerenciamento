"use client"

import { z } from "zod"

export const companyProfileFormSchema = z.object({
  cnpj: z.string().min(14, "Informe um CNPJ válido com 14 dígitos"),
  razao_social: z.string().min(2, "Informe a razão social"),
  nome_fantasia: z.string().nullable().optional(),
  email_empresa: z.string().email("Informe um e-mail válido").nullable().optional().or(z.literal("")),
  telefone_1: z.string().nullable().optional(),
  situacao_cadastral: z.string().nullable().optional(),
  data_situacao_cadastral: z.string().nullable().optional(),
  data_abertura: z.string().nullable().optional(),
  porte: z.string().nullable().optional(),
  natureza_juridica: z.string().nullable().optional(),
  cnae_fiscal_descricao: z.string().nullable().optional(),
  logradouro: z.string().nullable().optional(),
  numero: z.string().nullable().optional(),
  complemento: z.string().nullable().optional(),
  bairro: z.string().nullable().optional(),
  municipio: z.string().nullable().optional(),
  uf: z.string().nullable().optional(),
  cep: z.string().nullable().optional(),
  capital_social: z.string().nullable().optional(),
})

export type CompanyProfileFormValues = z.infer<typeof companyProfileFormSchema>
