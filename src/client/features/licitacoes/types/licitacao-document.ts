import type {
  LicitacaoDocumentProcessingStatus,
  LicitacaoDocumentType,
} from "../services/use-licitacao.service"

export type LicitacaoDraftContext = {
  licitacaoId: string
  licitacaoStatus: "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  editalId: string
  editalStatus: "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
}

export type LicitacaoDocumentItem = {
  localId: string
  documentId?: string
  type: LicitacaoDocumentType
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
