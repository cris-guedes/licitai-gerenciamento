"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import type {
    GenerateDocumentSummaryResponse,
    useDocumentSummaryService,
} from "../../../services/use-document-summary.service"

type DocumentSummaryService = ReturnType<typeof useDocumentSummaryService>

type Props = {
  documentId: string | null
  documentSummaryService: DocumentSummaryService
}

export function useDocumentAiTools({ documentId, documentSummaryService }: Props) {
  const [summary, setSummary] = useState<GenerateDocumentSummaryResponse | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [summaryError, setSummaryError] = useState<Error | null>(null)
  const [hasLoadedSummary, setHasLoadedSummary] = useState(false)
  const isLoadingSummaryRef = useRef(false)

  useEffect(() => {
    setSummary(null)
    setSummaryError(null)
    setIsLoadingSummary(false)
    setHasLoadedSummary(false)
    isLoadingSummaryRef.current = false
  }, [documentId])

  const handleLoadSummary = useCallback(async () => {
    if (!documentId || isLoadingSummaryRef.current || hasLoadedSummary) return

    isLoadingSummaryRef.current = true
    setIsLoadingSummary(true)
    setSummaryError(null)

    try {
      const response = await documentSummaryService.getSummary(documentId)
      setSummary(response)
      setHasLoadedSummary(true)
    } catch (error: unknown) {
      const nextError = error instanceof Error ? error : new Error(String(error))
      setSummaryError(nextError)
      toast.error(nextError.message)
    } finally {
      isLoadingSummaryRef.current = false
      setIsLoadingSummary(false)
    }
  }, [documentId, documentSummaryService, hasLoadedSummary])

  const handleGenerateSummary = useCallback(async () => {
    if (!documentId || isLoadingSummaryRef.current) return

    isLoadingSummaryRef.current = true
    setIsLoadingSummary(true)
    setSummaryError(null)

    try {
      const response = await documentSummaryService.generateSummary(documentId)
      setSummary(response)
      setHasLoadedSummary(true)
    } catch (error: unknown) {
      const nextError = error instanceof Error ? error : new Error(String(error))
      setSummaryError(nextError)
      toast.error(nextError.message)
    } finally {
      isLoadingSummaryRef.current = false
      setIsLoadingSummary(false)
    }
  }, [documentId, documentSummaryService])

  return {
    summary,
    summaryError,
    isLoadingSummary,
    hasLoadedSummary,
    handleLoadSummary,
    handleGenerateSummary,
  }
}
