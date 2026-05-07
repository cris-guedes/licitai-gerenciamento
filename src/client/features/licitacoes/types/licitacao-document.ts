import type {
  LicitacaoDocumentProcessingStatus,
  LicitacaoDocumentType,
} from "../services/use-licitacao.service"

export type LicitacaoDraftContext = {
  oportunidadeId: string
  oportunidadeStatus: "DRAFT" | "ACTIVE" | "CANCELLED"
  licitacaoId?: string | null
  licitacaoStatus?: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | null
  editalId?: string | null
  editalStatus?: "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | null
}

export type LicitacaoDocumentItem = {
  localId: string
  documentId?: string
  type: LicitacaoDocumentType
  displayName?: string
  originalName: string
  mimeType: string
  sizeBytes: number
  status: LicitacaoDocumentProcessingStatus
  progressPercent: number
  message: string
  previewUrl?: string
  documentUrl?: string
  previewUrlExpiresAt?: string
  uploadedAt?: string
  file: File | null
}
