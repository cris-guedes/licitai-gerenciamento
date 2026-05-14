"use client"

import { DocumentSummaryCard } from "@/client/features/documents"
import type { GenerateDocumentSummaryResponse } from "../../services/use-document-summary.service"

type Props = {
  summary: GenerateDocumentSummaryResponse
}

export function DocumentAiSummaryCard({ summary }: Props) {
  return <DocumentSummaryCard summary={summary} />
}
