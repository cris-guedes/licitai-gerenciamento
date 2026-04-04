import { z } from "zod"

// ── Required Documents keys ──────────────────────────────────────────────────

export const REQUIRED_DOCUMENT_KEYS = [
  { key: "cnpj",                label: "CNPJ" },
  { key: "inscricaoEstadual",   label: "Inscrição Estadual" },
  { key: "certidaoFgts",        label: "Certidão FGTS" },
  { key: "certidaoTribFed",     label: "Certidão Tributos Federais" },
  { key: "certidaoTribEst",     label: "Certidão Tributos Estaduais" },
  { key: "certidaoTribMun",     label: "Certidão Tributos Municipais" },
  { key: "certidaoTrab",        label: "Certidão Trabalhista" },
  { key: "certidaoFalencia",    label: "Certidão Falência/Recuperação" },
  { key: "contratoSocial",      label: "Contrato Social/Última Alteração" },
  { key: "docSocios",           label: "Doc Sócios" },
  { key: "balancete",           label: "Balanços" },
  { key: "atestado",            label: "Atestado" },
  { key: "inscricaoMunicipal",  label: "Inscrição Municipal" },
  { key: "certidaoJunta",       label: "Certidão da Junta" },
  { key: "certidaoCgu",         label: "Certidão Unificada CGU" },
  { key: "garantiaProposta",    label: "Garantia de Proposta" },
] as const

export const MODALITY_OPTIONS = [
  "Pregão Eletrônico",
  "Pregão Presencial",
  "Concorrência",
  "Concorrência Eletrônica",
  "Tomada de Preços",
  "Convite",
  "Leilão",
  "Dispensa de Licitação",
  "Inexigibilidade",
  "Diálogo Competitivo",
] as const

export const CONTRACT_TYPE_OPTIONS = [
  "Obras",
  "Serviços",
  "Compras",
  "Concessões",
  "Locações",
  "Outros",
] as const

export const SPHERE_OPTIONS = ["federal", "estadual", "municipal"] as const

export const JUDGMENT_OPTIONS = ["menor_preco", "maior_desconto", "melhor_tecnica"] as const
export const DISPUTE_OPTIONS  = ["aberto", "fechado", "aberto_fechado"] as const
export const GUARANTEE_OPTIONS = ["Sem Garantia", "Caução", "Seguro-Garantia", "Fiança Bancária"] as const
export const INSTALLATION_OPTIONS = ["Não Especificado", "Obrigatória", "Opcional"] as const

export const UF_OPTIONS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS",
  "MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC",
  "SE","SP","TO",
] as const

// ── Agency subform ───────────────────────────────────────────────────────────

const agencySchema = z.object({
  name: z.string().min(1),
  cnpj: z.string().optional(),
})

// ── Main schema ──────────────────────────────────────────────────────────────

export const novaLicitacaoSchema = z.object({
  // Dados da licitação
  object:         z.string().min(1, "Objeto é obrigatório"),
  modality:       z.string().min(1, "Modalidade é obrigatória"),
  contractType:   z.string().optional(),
  editalNumber:   z.string().optional(),
  portal:         z.string().optional(),
  sphere:         z.string().optional(),
  state:          z.string().optional(),
  editalUrl:      z.string().optional(),
  estimatedValue: z.union([z.coerce.number().positive(), z.literal("")]).optional(),
  publicationDate:  z.string().optional(),
  openingDate:      z.string().optional(),
  proposalDeadline: z.string().optional(),

  // Detalhes do pregão
  processNumber:         z.string().optional(),
  uasg:                  z.string().optional(),
  proposalDeadlineTime:  z.string().optional(),
  bidInterval:           z.union([z.coerce.number().positive(), z.literal("")]).optional(),
  judgmentCriteria:      z.string().optional(),
  disputeMode:           z.string().optional(),
  proposalValidityDays:  z.union([z.coerce.number().int().positive(), z.literal("")]).optional(),
  clarificationDeadline: z.string().optional(),
  regionality:           z.string().optional(),
  exclusiveSmallBusiness: z.boolean().default(false),
  allowsAdhesion:         z.boolean().default(false),

  // Documentos necessários
  requiredDocumentKeys: z.record(z.string(), z.boolean()).default({}),
  otherDocuments:       z.array(z.string()).default([]),

  // Regras do edital
  deliveryDays:    z.union([z.coerce.number().int().positive(), z.literal("")]).optional(),
  acceptanceDays:  z.union([z.coerce.number().int().positive(), z.literal("")]).optional(),
  liquidationDays: z.union([z.coerce.number().int().positive(), z.literal("")]).optional(),
  paymentDays:     z.union([z.coerce.number().int().positive(), z.literal("")]).optional(),
  guaranteeType:   z.string().optional(),
  guaranteeMonths: z.union([z.coerce.number().int().positive(), z.literal("")]).optional(),
  installation:    z.string().optional(),

  // Processo e logística
  agencyCnpj:              z.string().optional(),
  agencyStateRegistration: z.string().optional(),
  deliveryLocation:        z.string().optional(),
  zipCode:                 z.string().optional(),
  street:                  z.string().optional(),
  addressNumber:           z.string().optional(),
  neighborhood:            z.string().optional(),
  city:                    z.string().optional(),
  logisticsState:          z.string().optional(),
  complement:              z.string().optional(),
  auctioneerName:          z.string().optional(),
  auctioneerContact:       z.string().optional(),
  contractManagerName:     z.string().optional(),
  contractManagerContact:  z.string().optional(),
  notes:                   z.string().optional(),

  // Órgãos
  managingAgencies:      z.array(agencySchema).default([]),
  participatingAgencies: z.array(agencySchema).default([]),
})

export type NovaLicitacaoFormValues = z.infer<typeof novaLicitacaoSchema>
