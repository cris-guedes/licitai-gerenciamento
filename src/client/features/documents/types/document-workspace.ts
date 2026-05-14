export type DocumentWorkspaceProcessingState = "NOT_PROCESSED" | "PROCESSING" | "READY" | "FAILED"

export type DocumentWorkspaceAnalysisStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED"

export type DocumentWorkspaceAnalysisType = "EXTRACT_EDITAL" | "SUMMARY"

export type DocumentWorkspaceLinkKind =
  | "AVULSO"
  | "CAPTACAO"
  | "CONTRATO"
  | "EDITAL"
  | "EMPENHO"
  | "LICITACAO"
  | "OPORTUNIDADE"

export type DocumentWorkspaceDocument = {
  id: string
  companyId: string
  type: "EDITAL" | "ANEXO" | "OUTRO"
  title: string
  originalName: string
  mimeType: string
  sizeBytes: number
  uploadedAt: string
}

export type DocumentWorkspacePreview = {
  url: string
  expiresAt: string | null
  downloadUrl: string | null
  filename: string
  mimeType: string
}

export type DocumentWorkspaceProcessing = {
  state: DocumentWorkspaceProcessingState
  canProcess: boolean
  canRetry: boolean
  errorMessage: string | null
  progress: {
    step: string
    message: string
    percent: number
  } | null
}

export type DocumentWorkspaceAnalysis = {
  id: string
  type: DocumentWorkspaceAnalysisType
  status: DocumentWorkspaceAnalysisStatus
  markdownContent: string | null
  result: unknown
  metrics: unknown
  errorMessage: string | null
  startedAt: string | null
  finishedAt: string | null
  createdAt: string
  updatedAt: string
}

export type DocumentWorkspaceAi = {
  chat: {
    enabled: boolean
    blockedReason: string | null
    messageCount: number | null
  }
  summary: {
    enabled: boolean
    blockedReason: string | null
    latest: DocumentWorkspaceAnalysis | null
  }
  analyses: DocumentWorkspaceAnalysis[]
}

export type DocumentWorkspaceLink = {
  kind: DocumentWorkspaceLinkKind
  id: string
  label: string
  isPrimary: boolean
}

export type DocumentWorkspace = {
  document: DocumentWorkspaceDocument
  preview: DocumentWorkspacePreview
  processing: DocumentWorkspaceProcessing
  ai: DocumentWorkspaceAi
  links: DocumentWorkspaceLink[]
}
