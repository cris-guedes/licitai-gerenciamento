import type {
  LicitacaoWorkspaceResponse,
  OportunidadeBoardItem,
} from "@/client/features/licitacoes/services/use-licitacao.service"

export type OportunidadeWorkspaceDocument = LicitacaoWorkspaceResponse["documents"][number]

export type OportunidadeWorkspaceModel = {
  companyId: string
  oportunidade: OportunidadeBoardItem
  licitacaoWorkspace: LicitacaoWorkspaceResponse | null
  resumo: string | null
  latestSyncAt: string | null
  documents: OportunidadeWorkspaceDocument[]
  documentsSummary: {
    total: number
    ready: number
    processing: number
    failed: number
  }
  registration: {
    oportunidadeStatus: OportunidadeBoardItem["oportunidadeStatus"]
    licitacaoStatus: LicitacaoWorkspaceResponse["licitacao"]["status"]
    editalStatus: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | null
    hasLicitacao: boolean
    hasEdital: boolean
    hasDocuments: boolean
    hasReadyDocuments: boolean
  }
}
