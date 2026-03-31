import { z } from "zod"

export const cnaeSecundarioSchema = z.object({
  codigo:    z.number(),
  descricao: z.string(),
})

// ─── Step schemas ─────────────────────────────────────────────────────────────

export const identificacaoSchema = z.object({
  razao_social:  z.string().min(1, "Obrigatório"),
  nome_fantasia: z.string().nullable().optional(),
})

export const localizacaoSchema = z.object({
  cep:         z.string().optional(),
  logradouro:  z.string().optional(),
  numero:      z.string().optional(),
  complemento: z.string().nullable().optional(),
  bairro:      z.string().optional(),
  municipio:   z.string().optional(),
  uf:          z.string().optional(),
})

export const atividadeSchema = z.object({
  cnae_fiscal:           z.string().optional(),
  cnae_fiscal_descricao: z.string().optional(),
  cnaes_secundarios:     z.array(cnaeSecundarioSchema).optional(),
})

// ─── Types ────────────────────────────────────────────────────────────────────

export type CnaeSecundario    = z.infer<typeof cnaeSecundarioSchema>
export type IdentificacaoData = z.infer<typeof identificacaoSchema>
export type LocalizacaoData   = z.infer<typeof localizacaoSchema>
export type AtividadeData     = z.infer<typeof atividadeSchema>

// Full payload sent to the backend
export type OnboardingSubmitData = IdentificacaoData & LocalizacaoData & Omit<AtividadeData, "cnae_fiscal"> & {
  cnpj:                    string
  cnae_fiscal:             number | undefined
  situacao_cadastral?:     string
  natureza_juridica?:      string
  data_abertura?:          string
  porte?:                  string
  data_situacao_cadastral?: string
  telefone_1?:             string | null
  email_empresa?:          string | null
  capital_social?:         number
  opcao_pelo_simples?:     boolean | null
  opcao_pelo_mei?:         boolean | null
}
