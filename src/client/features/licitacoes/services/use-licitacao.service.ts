"use client"

import { useState, useCallback } from "react"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core/CoreApiClient"
import type { ExtractEditalDataResponse } from "@/client/main/infra/apis/api-core/models/ExtractEditalDataResponse"
import type { UploadEditalDocumentResponse } from "@/client/main/infra/apis/api-core/models/UploadEditalDocumentResponse"

export type LicitacaoDocumentType = "EDITAL" | "ANEXO" | "OUTRO"
export type LicitacaoDocumentProcessingStatus = "AWAITING_UPLOAD" | "UPLOADING" | "PROCESSING" | "READY" | "FAILED"

export type UploadLicitacaoDocumentResponse = {
  licitacaoId: string
  licitacaoStatus: "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  editalId: string
  editalStatus: "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  documentId: string
  documentType: LicitacaoDocumentType
  originalName: string
  mimeType: string
  sizeBytes: number
  status: "PROCESSING" | "READY" | "FAILED"
  documentUrl: string
  previewUrl: string
  previewUrlExpiresAt: string
  uploadedAt: string
}

export type UploadLicitacaoDocumentProgressEvent = {
  type: "progress"
  step: string
  message: string
  percent: number
  status: "UPLOADING" | "PROCESSING" | "READY" | "FAILED"
  context?: {
    licitacaoId: string
    editalId: string
    documentId: string
    documentType: LicitacaoDocumentType
  }
}

export type UploadLicitacaoDocumentDoneEvent = {
  type: "done"
  step: "done"
  message: string
  percent: number
  status: "READY"
  result: UploadLicitacaoDocumentResponse
}

export type UploadLicitacaoDocumentErrorEvent = {
  type: "error"
  step: "error"
  message: string
  percent: number
  status: "FAILED"
}

export type UploadLicitacaoDocumentEvent =
  | UploadLicitacaoDocumentProgressEvent
  | UploadLicitacaoDocumentDoneEvent
  | UploadLicitacaoDocumentErrorEvent

export type DeleteLicitacaoDocumentResponse = {
  documentId: string
  deleted: true
}

type ExtractedItem = NonNullable<NonNullable<ExtractEditalDataResponse["licitacao"]["edital"]>["itens"]>[number]

type PartialExtractionResponse = Pick<ExtractEditalDataResponse, "sessionId" | "mdContent" | "licitacao">

type ProgressEvent = {
  type?: "progress"
  scope?: "info" | "items" | "orchestration"
  step: string
  message: string
  percent: number
  pipelinePercent?: number
}

type PartialInfoEvent = {
  type: "partial_info"
  scope: "info"
  step: string
  message: string
  percent: number
  pipelinePercent: number
  partialItemsCount: number
  result: PartialExtractionResponse
}

type PartialItemsBatchEvent = {
  type: "partial_items_batch"
  scope: "items"
  step: string
  message: string
  percent: number
  pipelinePercent: number
  batch: {
    batchIndex: number
    totalBatches: number
    completedBatches: number
    batchTimeMs: number
    batchPayloadCount: number
    batchPayloadChars: number
    batchItems: ExtractedItem[]
    cumulativeItems: ExtractedItem[]
    cumulativeItemsCount: number
  }
  result: PartialExtractionResponse
}

type DoneEvent = {
  type: "done"
  step: "done"
  message: string
  percent: number
  result: ExtractEditalDataResponse
}

type ErrorEvent = {
  type: "error"
  step: "error"
  message: string
  percent: number
}

type StreamEvent = ProgressEvent | PartialInfoEvent | PartialItemsBatchEvent | DoneEvent | ErrorEvent

export type ExtractionPipelineProgress = {
  percent: number
  step: string
  message: string
  completed: boolean
  completedBatches: number
  totalBatches: number
  extractedItems: number
}

export type ExtractionProgressState = {
  info: ExtractionPipelineProgress
  items: ExtractionPipelineProgress
  orchestrationMessage: string
}

export type PartialExtractionPreview = {
  sessionId: string | null
  partialResponse: PartialExtractionResponse | null
  infoReady: boolean
  items: ExtractedItem[]
  completedBatches: number
  totalBatches: number
  lastBatchItems: ExtractedItem[]
}

function createInitialPipelineProgress(message: string): ExtractionPipelineProgress {
  return {
    percent: 0,
    step: "",
    message,
    completed: false,
    completedBatches: 0,
    totalBatches: 0,
    extractedItems: 0,
  }
}

function createInitialProgressState(): ExtractionProgressState {
  return {
    info: createInitialPipelineProgress("Aguardando início da extração de informações."),
    items: createInitialPipelineProgress("Aguardando início da extração de itens."),
    orchestrationMessage: "Aguardando upload do edital.",
  }
}

function createInitialPreviewState(): PartialExtractionPreview {
  return {
    sessionId: null,
    partialResponse: null,
    infoReady: false,
    items: [],
    completedBatches: 0,
    totalBatches: 0,
    lastBatchItems: [],
  }
}

function parseEventBlock<TEvent>(block: string): TEvent | null {
  const data = block
    .split(/\r?\n/)
    .filter(line => line.startsWith("data:"))
    .map(line => line.slice(5).trim())
    .join("\n")

  if (!data) return null
  return JSON.parse(data) as TEvent
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

export function useLicitacaoService(_api: CoreApiClient) {
  const useUploadEdital = () => {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const reset = useCallback(() => {
      setError(null)
    }, [])

    const mutateAsync = useCallback(async ({
      file,
      companyId,
    }: {
      file: File
      companyId: string
    }): Promise<UploadEditalDocumentResponse> => {
      setIsPending(true)
      setError(null)

      try {
        return await _api.licitacao.uploadEditalDocument({
          formData: {
            companyId,
            file,
          },
        })
      } catch (e: unknown) {
        const err = toError(e)
        setError(err)
        throw err
      } finally {
        setIsPending(false)
      }
    }, [])

    return { mutateAsync, isPending, error, reset }
  }

  const useExtractEdital = () => {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [progress, setProgress] = useState<ExtractionProgressState>(createInitialProgressState)
    const [preview, setPreview] = useState<PartialExtractionPreview>(createInitialPreviewState)

    const reset = useCallback(() => {
      setError(null)
      setProgress(createInitialProgressState())
      setPreview(createInitialPreviewState())
    }, [])

    const updatePipelineProgress = useCallback((scope: "info" | "items", event: ProgressEvent) => {
      setProgress(prev => ({
        ...prev,
        [scope]: {
          ...prev[scope],
          percent: event.pipelinePercent ?? prev[scope].percent,
          step: event.step,
          message: event.message,
          completed: (event.pipelinePercent ?? prev[scope].percent) >= 100,
        },
      }))
    }, [])

    const handleEvent = useCallback((event: StreamEvent): ExtractEditalDataResponse | null => {
      if (event.type === "done") {
        setProgress(prev => ({
          ...prev,
          orchestrationMessage: event.message,
          info: { ...prev.info, percent: 100, completed: true, message: "Extração de informações concluída." },
          items: { ...prev.items, percent: 100, completed: true, message: "Extração de itens concluída." },
        }))
        return event.result
      }

      if (event.type === "error") {
        throw new Error(event.message)
      }

      if (event.type === "partial_info") {
        setPreview(prev => ({
          ...prev,
          sessionId: event.result.sessionId,
          partialResponse: event.result,
          infoReady: true,
          items: event.result.licitacao.edital?.itens ?? prev.items,
        }))

        setProgress(prev => ({
          ...prev,
          info: {
            ...prev.info,
            percent: event.pipelinePercent,
            step: event.step,
            message: event.message,
            completed: true,
          },
          orchestrationMessage: event.message,
        }))

        return null
      }

      if (event.type === "partial_items_batch") {
        setPreview(prev => ({
          ...prev,
          sessionId: event.result.sessionId,
          partialResponse: event.result,
          items: event.batch.cumulativeItems,
          completedBatches: event.batch.completedBatches,
          totalBatches: event.batch.totalBatches,
          lastBatchItems: event.batch.batchItems,
        }))

        setProgress(prev => ({
          ...prev,
          items: {
            ...prev.items,
            percent: event.pipelinePercent,
            step: event.step,
            message: event.message,
            completed: event.batch.completedBatches === event.batch.totalBatches,
            completedBatches: event.batch.completedBatches,
            totalBatches: event.batch.totalBatches,
            extractedItems: event.batch.cumulativeItemsCount,
          },
          orchestrationMessage: event.message,
        }))

        return null
      }

      if (event.scope === "info" || event.scope === "items") {
        updatePipelineProgress(event.scope, event)
      }

      setProgress(prev => ({
        ...prev,
        orchestrationMessage: event.message,
      }))

      return null
    }, [updatePipelineProgress])

    const mutateAsync = useCallback(async ({
      companyId,
      file,
      documentId,
    }: {
      companyId: string
      file?: File
      documentId?: string
    }): Promise<ExtractEditalDataResponse> => {
      setIsPending(true)
      setError(null)
      setProgress(createInitialProgressState())
      setPreview(createInitialPreviewState())

      try {
        const isPostEmbedding = Boolean(documentId)
        const url = isPostEmbedding
          ? `/api/core/extract-edital-data-post-embeding/stream?companyId=${encodeURIComponent(companyId)}&documentId=${encodeURIComponent(documentId!)}`
          : `/api/core/extract-edital-data/stream?companyId=${encodeURIComponent(companyId)}`

        let res: Response

        if (isPostEmbedding) {
          res = await fetch(url, {
            method: "POST",
          })
        } else {
          if (!file) {
            throw new Error("Envie o PDF do edital para iniciar a extração.")
          }

          const formData = new FormData()
          formData.append("file", file)

          res = await fetch(url, {
            method: "POST",
            body: formData,
          })
        }

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.message ?? `Erro ${res.status} na extração`)
        }

        if (!res.body) {
          throw new Error("O stream de extração não retornou conteúdo.")
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        let finalResult: ExtractEditalDataResponse | null = null

        while (true) {
          const { done, value } = await reader.read()
          buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done })

          const blocks = buffer.split(/\r?\n\r?\n/)
          buffer = blocks.pop() ?? ""

          for (const block of blocks) {
            const event = parseEventBlock<StreamEvent>(block)
            if (!event) continue

            const maybeResult = handleEvent(event)
            if (maybeResult) {
              finalResult = maybeResult
            }
          }

          if (done) break
        }

        if (!finalResult) {
          throw new Error("A extração terminou sem enviar o resultado final.")
        }

        return finalResult
      } catch (e: unknown) {
        const err = toError(e)
        setError(err)
        throw err
      } finally {
        setIsPending(false)
      }
    }, [handleEvent])

    return { mutateAsync, isPending, error, reset, progress, preview }
  }

  const useUploadLicitacaoDocumentStream = () => {
    const [pendingCount, setPendingCount] = useState(0)
    const [error, setError] = useState<Error | null>(null)

    const reset = useCallback(() => {
      setError(null)
    }, [])

    const mutateAsync = useCallback(async ({
      file,
      companyId,
      documentType,
      licitacaoId,
      editalId,
      replaceDocumentId,
      onEvent,
    }: {
      file: File
      companyId: string
      documentType: LicitacaoDocumentType
      licitacaoId?: string
      editalId?: string
      replaceDocumentId?: string
      onEvent?: (event: UploadLicitacaoDocumentEvent) => void
    }): Promise<UploadLicitacaoDocumentResponse> => {
      setPendingCount(current => current + 1)
      setError(null)

      try {
        const formData = new FormData()
        formData.append("file", file)

        const query = new URLSearchParams({
          companyId,
          documentType,
        })

        if (licitacaoId) query.set("licitacaoId", licitacaoId)
        if (editalId) query.set("editalId", editalId)
        if (replaceDocumentId) query.set("replaceDocumentId", replaceDocumentId)

        const res = await fetch(`/api/core/upload-licitacao-document/stream?${query.toString()}`, {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.message ?? `Erro ${res.status} no upload do documento`)
        }

        if (!res.body) {
          throw new Error("O stream de upload não retornou conteúdo.")
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""
        let finalResult: UploadLicitacaoDocumentResponse | null = null

        while (true) {
          const { done, value } = await reader.read()
          buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done })

          const blocks = buffer.split(/\r?\n\r?\n/)
          buffer = blocks.pop() ?? ""

          for (const block of blocks) {
            const event = parseEventBlock<UploadLicitacaoDocumentEvent>(block)
            if (!event) continue

            onEvent?.(event)

            if (event.type === "done") {
              finalResult = event.result
            }

            if (event.type === "error") {
              throw new Error(event.message)
            }
          }

          if (done) break
        }

        if (!finalResult) {
          throw new Error("O upload terminou sem enviar o resultado final.")
        }

        return finalResult
      } catch (e: unknown) {
        const err = toError(e)
        setError(err)
        throw err
      } finally {
        setPendingCount(current => Math.max(0, current - 1))
      }
    }, [])

    const isPending = pendingCount > 0

    return { mutateAsync, isPending, error, reset }
  }

  const useDeleteLicitacaoDocument = () => {
    const [isPending, setIsPending] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const reset = useCallback(() => {
      setError(null)
    }, [])

    const mutateAsync = useCallback(async ({
      companyId,
      documentId,
    }: {
      companyId: string
      documentId: string
    }): Promise<DeleteLicitacaoDocumentResponse> => {
      setIsPending(true)
      setError(null)

      try {
        const res = await fetch("/api/core/delete-licitacao-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyId, documentId }),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.message ?? `Erro ${res.status} ao excluir documento`)
        }

        return await res.json()
      } catch (e: unknown) {
        const err = toError(e)
        setError(err)
        throw err
      } finally {
        setIsPending(false)
      }
    }, [])

    return { mutateAsync, isPending, error, reset }
  }

  return { useUploadEdital, useUploadLicitacaoDocumentStream, useDeleteLicitacaoDocument, useExtractEdital }
}
