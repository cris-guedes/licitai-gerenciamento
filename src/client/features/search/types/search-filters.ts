// ─── Core type ────────────────────────────────────────────────────────────────

export type Ordenacao = "relevancia" | "-data" | "data"

export type SearchFilters = {
  q:                         string
  status:                    "recebendo_proposta" | "propostas_encerradas" | "encerrada" | ""
  ordenacao:                 Ordenacao
  tiposDocumento:            Array<"edital" | "aviso_licitacao" | "dispensa" | "inexigibilidade">
  ufs:                       string[]
  modalidades:               number[]
  esferas:                   Array<"F" | "E" | "M" | "D">
  poderes:                   Array<"E" | "L" | "J">
  tipos:                     Array<1 | 2 | 3 | 4>
  fontesOrcamentarias:       Array<"federal" | "estadual" | "municipal" | "organismo_internacional" | "nao_se_aplica">
  tiposMargensPreferencia:   Array<"resolucao_cics" | "resolucao_ciia_pac">
  exigenciaConteudoNacional: boolean | null
  pagina:                    number
}

export const SEARCH_FILTERS_DEFAULT: SearchFilters = {
  q:                         "",
  status:                    "recebendo_proposta",
  ordenacao:                 "relevancia",
  tiposDocumento:            [],
  ufs:                       [],
  modalidades:               [],
  esferas:                   [],
  poderes:                   [],
  tipos:                     [],
  fontesOrcamentarias:       [],
  tiposMargensPreferencia:   [],
  exigenciaConteudoNacional: null,
  pagina:                    1,
}

// ─── Options ──────────────────────────────────────────────────────────────────

export const STATUS_OPTIONS: { value: SearchFilters["status"]; label: string }[] = [
  { value: "recebendo_proposta",  label: "A Receber/Recebendo Proposta" },
  { value: "propostas_encerradas", label: "Em Julgamento/Propostas Encerradas" },
  { value: "encerrada",           label: "Encerradas" },
  { value: "",                    label: "Todos" },
]

export const TIPO_DOCUMENTO_OPTIONS: { value: SearchFilters["tiposDocumento"][number]; label: string }[] = [
  { value: "edital",          label: "Edital" },
  { value: "aviso_licitacao", label: "Aviso de Licitação" },
  { value: "dispensa",        label: "Dispensa" },
  { value: "inexigibilidade", label: "Inexigibilidade" },
]

export const MODALIDADE_OPTIONS: { value: number; label: string }[] = [
  { value: 6,  label: "Pregão Eletrônico" },
  { value: 7,  label: "Pregão Presencial" },
  { value: 4,  label: "Concorrência Eletrônica" },
  { value: 5,  label: "Concorrência Presencial" },
  { value: 8,  label: "Dispensa de Licitação" },
  { value: 9,  label: "Inexigibilidade" },
  { value: 3,  label: "Concurso" },
  { value: 1,  label: "Leilão Eletrônico" },
  { value: 2,  label: "Diálogo Competitivo" },
  { value: 12, label: "Manifestação de Interesse" },
  { value: 13, label: "Pré-qualificação" },
]

export const ESFERA_OPTIONS: { value: SearchFilters["esferas"][number]; label: string }[] = [
  { value: "F", label: "Federal" },
  { value: "E", label: "Estadual" },
  { value: "M", label: "Municipal" },
  { value: "D", label: "Distrital" },
]

export const PODER_OPTIONS: { value: SearchFilters["poderes"][number]; label: string }[] = [
  { value: "E", label: "Executivo" },
  { value: "L", label: "Legislativo" },
  { value: "J", label: "Judiciário" },
]

export const TIPO_OPTIONS: { value: SearchFilters["tipos"][number]; label: string }[] = [
  { value: 1, label: "Bem" },
  { value: 2, label: "Serviço" },
  { value: 3, label: "Obra" },
  { value: 4, label: "Serviço de Engenharia" },
]

export const FONTE_ORCAMENTARIA_OPTIONS: { value: SearchFilters["fontesOrcamentarias"][number]; label: string }[] = [
  { value: "federal",               label: "Federal" },
  { value: "estadual",              label: "Estadual" },
  { value: "municipal",             label: "Municipal" },
  { value: "organismo_internacional", label: "Organismo Internacional" },
  { value: "nao_se_aplica",         label: "Não se aplica" },
]

export const MARGEM_PREFERENCIA_OPTIONS: { value: SearchFilters["tiposMargensPreferencia"][number]; label: string }[] = [
  { value: "resolucao_cics",     label: "Resolução CICS" },
  { value: "resolucao_ciia_pac", label: "Resolução CIIA/PAC" },
]

export const UF_OPTIONS: { value: string; label: string }[] = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
]
