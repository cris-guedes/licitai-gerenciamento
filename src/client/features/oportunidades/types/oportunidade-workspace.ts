import type {
  LicitacaoWorkspaceResponse,
  OportunidadeBoardItem,
  OportunidadeWorkspaceNote,
  OportunidadeWorkspaceTask,
} from "@/client/features/licitacoes/services/use-licitacao.service"

export type OportunidadeWorkspaceDocument = LicitacaoWorkspaceResponse["documents"][number]
export type OportunidadeWorkspaceQualification = NonNullable<LicitacaoWorkspaceResponse["edital"]>["habilitacoes"][number]

export type OportunidadeWorkspaceModel = {
  companyId: string
  oportunidade: OportunidadeBoardItem
  licitacaoWorkspace: LicitacaoWorkspaceResponse | null
  resumo: string | null
  latestSyncAt: string | null
  documents: OportunidadeWorkspaceDocument[]
  tasks: OportunidadeWorkspaceTask[]
  notes: OportunidadeWorkspaceNote[]
  documentsSummary: {
    total: number
    ready: number
    processing: number
    failed: number
  }
  tasksSummary: {
    total: number
    open: number
    done: number
    overdue: number
  }
  qualificationSummary: {
    total: number
    mandatory: number
    optional: number
    categories: number
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
