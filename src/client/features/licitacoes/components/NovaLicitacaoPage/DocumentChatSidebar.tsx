"use client"

import { DocumentChatPanel } from "@/client/features/documents"
import type { useDocumentChatService } from "../../services/use-document-chat.service"

type DocumentChatService = ReturnType<typeof useDocumentChatService>

type Props = {
  documentId: string | null
  documentChatService: DocumentChatService
}

export function DocumentChatSidebar({
  documentId,
  documentChatService,
}: Props) {
  return (
    <DocumentChatPanel
      documentId={documentId}
      documentChatService={documentChatService}
    />
  )
}
