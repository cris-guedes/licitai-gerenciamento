import { z } from "zod"

export const createLicitacaoSchema = z.object({
  object:         z.string().min(1, "Objeto é obrigatório"),
  modality:       z.string().min(1, "Modalidade é obrigatória"),
  contractType:   z.string().optional(),
  estimatedValue: z.union([z.coerce.number().positive("Deve ser maior que zero"), z.literal("")]).optional(),
  openingDate:    z.string().optional(),
})

export type CreateLicitacaoFormValues = z.infer<typeof createLicitacaoSchema>

export const MODALITY_OPTIONS = [
  "Pregão Eletrônico",
  "Pregão Presencial",
  "Concorrência",
  "Tomada de Preços",
  "Convite",
  "Leilão",
  "Dispensa de Licitação",
  "Inexigibilidade",
] as const

export const CONTRACT_TYPE_OPTIONS = [
  "Obras",
  "Serviços",
  "Compras",
  "Concessões",
  "Locações",
  "Outros",
] as const
