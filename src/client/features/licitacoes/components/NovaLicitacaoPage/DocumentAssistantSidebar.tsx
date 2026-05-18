"use client"

import { DocumentAiPanel } from "@/client/features/documents"
import type { useDocumentChatService } from "../../services/use-document-chat.service"
import type { useDocumentSummaryService } from "../../services/use-document-summary.service"

type DocumentChatService = ReturnType<typeof useDocumentChatService>
type DocumentSummaryService = ReturnType<typeof useDocumentSummaryService>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentId: string | null
  documentChatService: DocumentChatService
  documentSummaryService: DocumentSummaryService
}

export function DocumentAssistantSidebar({
  open,
  onOpenChange,
  documentId,
  documentChatService,
  documentSummaryService,
}: Props) {
  return (
    <DocumentAiPanel
      open={open}
      onOpenChange={onOpenChange}
      documentId={documentId}
      documentChatService={documentChatService}
      documentSummaryService={documentSummaryService}
    />
  )
}
