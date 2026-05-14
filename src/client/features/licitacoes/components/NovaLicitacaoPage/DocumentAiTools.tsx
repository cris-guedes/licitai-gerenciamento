"use client"

import { DocumentSummaryPanel } from "@/client/features/documents"
import type { useDocumentSummaryService } from "../../services/use-document-summary.service"

type DocumentSummaryService = ReturnType<typeof useDocumentSummaryService>

type Props = {
  active: boolean
  documentId: string | null
  documentSummaryService: DocumentSummaryService
}

export function DocumentAiTools({
  active,
  documentId,
  documentSummaryService,
}: Props) {
  return (
    <DocumentSummaryPanel
      active={active}
      documentId={documentId}
      documentSummaryService={documentSummaryService}
    />
  )
}
