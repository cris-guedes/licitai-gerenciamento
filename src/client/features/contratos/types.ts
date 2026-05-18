export type ContratoStatus = "RASCUNHO" | "VIGENTE" | "ENCERRADO" | "RESCINDIDO" | "CANCELADO"

export type ContratoListItem = {
  id: string
  oportunidadeId: string
  companyId: string
  numeroContrato: string | null
  anoContrato: number | null
  processo: string | null
  objetoContrato: string | null
  tipoContrato: string | null
  fornecedorCnpjCpf: string | null
  fornecedorNome: string | null
  valorInicial: string | null
  valorGlobal: string | null
  valorTotal: string | null
  dataAssinatura: string | null
  dataVigenciaInicio: string | null
  dataVigenciaFim: string | null
  status: ContratoStatus
  createdAt: string
  updatedAt: string
  oportunidade?: {
    id: string
    title: string
    numero: string | null
    orgaoNome: string | null
    valorEstimado: string | null
  } | null
}

export type ContratosListResponse = {
  data: ContratoListItem[]
  totalRegistros: number
}

export type ContratoItem = {
  id: string
  oportunidadeItemId: string
  itemNumero: number | null
  descricao: string
  unidadeMedida: string | null
  quantidadeContratada: string | null
  quantidadeEmpenhada: string
  quantidadeEntregue: string
  quantidadePaga: string
  valorUnitario: string | null
  valorTotal: string | null
}

export type EmpenhoEntrega = {
  id: string
  empenhoItemId: string
  quantidade: string
  quantidadeEntregue: string
  dataEntrega?: string | null
  createdAt: string
  status: string
  observacoes?: string | null
  empenhoItem?: {
    id: string
    contratoItem: ContratoItem | null
  }
}

export type ContratoEmpenhoItem = {
  id: string
  contratoItemId: string
  quantidade: string
  valorUnitario: string | null
  valorTotal: string | null
  contratoItem: ContratoItem | null
  entregas: EmpenhoEntrega[]
}

export type EmpenhoLocalEntrega = {
  id: string
  orgaoNome?: string | null
  logradouro?: string | null
  numero?: string | null
  cidade?: string | null
  estado?: string | null
}

export type ContratoEmpenho = {
  id: string
  numeroEmpenho: string
  status: string
  valor: string
  dataEmissao?: string | null
  itens: ContratoEmpenhoItem[]
  entregas: EmpenhoEntrega[]
  locaisEntrega: EmpenhoLocalEntrega[]
}

export type ContratoWorkspaceData = {
  contrato: ContratoListItem
  oportunidade?: {
    id: string
    edital?: {
      objeto?: string | null
      orgaoRazaoSocial?: string | null
    } | null
    licitacao?: {
      objetoResumo?: string | null
      orgaoGerenciador?: {
        razaoSocial?: string | null
      } | null
    } | null
  } | null
  itens: ContratoItem[]
  empenhos: ContratoEmpenho[]
}

export type ContratoWorkspaceResponse = {
  data: ContratoWorkspaceData
}

export const CONTRATO_STATUS_LABEL: Record<ContratoStatus, string> = {
  RASCUNHO: "Rascunho",
  VIGENTE: "Vigente",
  ENCERRADO: "Encerrado",
  RESCINDIDO: "Rescindido",
  CANCELADO: "Cancelado",
}
