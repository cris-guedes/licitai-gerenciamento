"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { ExtractEditalDataResponse } from "@/client/main/infra/apis/api-core/models/ExtractEditalDataResponse"
import type {
  LicitacaoDocumentProcessingStatus,
  LicitacaoDocumentType,
  UploadLicitacaoDocumentEvent,
} from "../../../services/use-licitacao.service"
import type {
  LicitacaoDocumentItem,
  LicitacaoDraftContext,
} from "../../../types/licitacao-document"
import { useLicitacaoService } from "../../../services/use-licitacao.service"
import {
  createNovaLicitacaoDefaultValues,
  novaLicitacaoFormSchema,
  type NovaLicitacaoFormValues,
} from "../../../schemas/nova-licitacao.schema"
import { mapExtractedLicitacaoToFormValues } from "../../../utils/map-extracted-licitacao-to-form-values"

type LicitacaoService = ReturnType<typeof useLicitacaoService>

type Props = {
  licitacaoService: LicitacaoService
  companyId: string | null
}

type AppliedExtraction = {
  sessionId: string
  pdfFilename: string
  itemsExtracted: number
  appliedAt: string
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  if (
    typeof error === "object" &&
    error !== null &&
    "body" in error &&
    typeof (error as { body?: { message?: unknown } }).body?.message === "string"
  ) {
    return (error as { body?: { message?: string } }).body?.message ?? fallback
  }

  return fallback
}

function createLocalDocumentId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function mapStreamStatus(status: "UPLOADING" | "PROCESSING" | "READY" | "FAILED"): LicitacaoDocumentProcessingStatus {
  return status
}

export function useNovaLicitacaoPage({ licitacaoService, companyId }: Props) {
  const form = useForm<NovaLicitacaoFormValues>({
    resolver: zodResolver(novaLicitacaoFormSchema),
    defaultValues: createNovaLicitacaoDefaultValues(),
  })

  const uploadDocument = licitacaoService.useUploadLicitacaoDocumentStream()
  const deleteDocument = licitacaoService.useDeleteLicitacaoDocument()
  const extraction = licitacaoService.useExtractEdital()
  const [stage, setStage] = useState<"upload" | "form">("upload")
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false)
  const [extractionResult, setExtractionResult] = useState<ExtractEditalDataResponse | null>(null)
  const [appliedExtraction, setAppliedExtraction] = useState<AppliedExtraction | null>(null)
  const [draftContext, setDraftContext] = useState<LicitacaoDraftContext | null>(null)
  const [documents, setDocuments] = useState<LicitacaoDocumentItem[]>([])
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)

  const selectedDocument = useMemo(() => {
    if (!documents.length) return null
    return documents.find(document => document.localId === selectedDocumentId) ?? documents[0]
  }, [documents, selectedDocumentId])

  useEffect(() => {
    if (documents.length > 0) return
    setIsWorkspaceModalOpen(false)
  }, [documents.length])

  const primaryEditalDocument = useMemo(() => {
    return documents.find(document => document.type === "EDITAL") ?? null
  }, [documents])

  function updateDocument(localId: string, updater: (current: LicitacaoDocumentItem) => LicitacaoDocumentItem) {
    setDocuments(prev => prev.map(document => (document.localId === localId ? updater(document) : document)))
  }

  function applyUploadEvent(localId: string, file: File, documentType: LicitacaoDocumentType, event: UploadLicitacaoDocumentEvent) {
    if (event.type === "progress") {
      const context = event.context

      if (context) {
        setDraftContext(prev => prev ?? {
          licitacaoId: context.licitacaoId,
          licitacaoStatus: "IN_PROGRESS",
          editalId: context.editalId,
          editalStatus: "IN_PROGRESS",
        })
      }

      updateDocument(localId, current => ({
        ...current,
        type: documentType,
        file,
        status: mapStreamStatus(event.status),
        progressPercent: event.percent,
        message: event.message,
        documentId: context?.documentId ?? current.documentId,
      }))

      return
    }

    if (event.type === "done") {
      setDraftContext({
        licitacaoId: event.result.licitacaoId,
        licitacaoStatus: event.result.licitacaoStatus,
        editalId: event.result.editalId,
        editalStatus: event.result.editalStatus,
      })

      updateDocument(localId, () => ({
        localId,
        documentId: event.result.documentId,
        type: event.result.documentType,
        originalName: event.result.originalName,
        mimeType: event.result.mimeType,
        sizeBytes: event.result.sizeBytes,
        status: "READY",
        progressPercent: 100,
        message: event.message,
        previewUrl: event.result.previewUrl,
        documentUrl: event.result.documentUrl,
        previewUrlExpiresAt: event.result.previewUrlExpiresAt,
        uploadedAt: event.result.uploadedAt,
        file,
      }))

      return
    }

    updateDocument(localId, current => ({
      ...current,
      type: documentType,
      file,
      status: "FAILED",
      progressPercent: current.progressPercent,
      message: event.message,
    }))
  }

  async function handleUploadDocument({
    file,
    documentType,
    replaceDocumentLocalId,
  }: {
    file: File
    documentType: LicitacaoDocumentType
    replaceDocumentLocalId?: string
  }) {
    if (!companyId) {
      throw new Error("Nenhuma empresa ativa selecionada para vincular este documento.")
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
    if (!isPdf) {
      const error = new Error("Envie um arquivo PDF válido para iniciar o cadastro da licitação.")
      toast.error(error.message)
      throw error
    }

    if (file.size > 50 * 1024 * 1024) {
      const error = new Error("O documento deve ter no máximo 50MB.")
      toast.error(error.message)
      throw error
    }

    const localId = replaceDocumentLocalId ?? createLocalDocumentId()
    const replacingDocument = replaceDocumentLocalId
      ? documents.find(document => document.localId === replaceDocumentLocalId) ?? null
      : null

    const provisionalDocument: LicitacaoDocumentItem = {
      localId,
      documentId: replacingDocument?.documentId,
      type: documentType,
      originalName: file.name,
      mimeType: file.type || "application/pdf",
      sizeBytes: file.size,
      status: "UPLOADING",
      progressPercent: 4,
      message: "Arquivo recebido, iniciando upload.",
      previewUrl: undefined,
      documentUrl: undefined,
      previewUrlExpiresAt: undefined,
      uploadedAt: replacingDocument?.uploadedAt,
      file,
    }

    setDocuments(prev => {
      if (replaceDocumentLocalId) {
        return prev.map(document => (document.localId === replaceDocumentLocalId ? provisionalDocument : document))
      }

      return [...prev, provisionalDocument]
    })
    setSelectedDocumentId(localId)
    setExtractionResult(null)
    extraction.reset()
    setStage("form")
    setIsWorkspaceModalOpen(true)

    try {
      const result = await uploadDocument.mutateAsync({
        file,
        companyId,
        documentType,
        licitacaoId: draftContext?.licitacaoId,
        editalId: draftContext?.editalId,
        replaceDocumentId: replacingDocument?.documentId,
        onEvent: event => applyUploadEvent(localId, file, documentType, event),
      })

      toast.success(
        replaceDocumentLocalId
          ? "Documento substituído e reprocessado com sucesso."
          : "Documento enviado e processado com sucesso.",
      )

      return result
    } catch (error: unknown) {
      updateDocument(localId, current => ({
        ...current,
        status: "FAILED",
        message: getErrorMessage(error, "Não foi possível processar o documento."),
      }))

      toast.error(getErrorMessage(error, "Não foi possível enviar o documento."))
      throw error
    }
  }

  async function handleDeleteDocument(localId: string) {
    const document = documents.find(item => item.localId === localId)
    if (!document) return

    const confirmed = window.confirm(`Deseja excluir o documento "${document.originalName}"?`)
    if (!confirmed) return

    try {
      if (document.documentId && companyId) {
        await deleteDocument.mutateAsync({
          companyId,
          documentId: document.documentId,
        })
      }

      const remainingDocuments = documents.filter(item => item.localId !== localId)
      setDocuments(remainingDocuments)
      setSelectedDocumentId(prev => (prev === localId ? (remainingDocuments[0]?.localId ?? null) : prev))
      setExtractionResult(null)
      extraction.reset()

      toast.success("Documento excluído com sucesso.")
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Não foi possível excluir o documento."))
      throw error
    }
  }

  function handleSelectDocument(localId: string) {
    if (localId !== selectedDocumentId) {
      setExtractionResult(null)
      extraction.reset()
    }

    setSelectedDocumentId(localId)
  }

  async function handleExtractDocument(documentId: string) {
    if (!companyId) {
      throw new Error("Nenhuma empresa ativa selecionada para vincular este documento.")
    }

    setExtractionResult(null)
    const result = await extraction.mutateAsync({ companyId, documentId })
    setExtractionResult(result)
  }

  function handleApplyExtraction() {
    if (!extractionResult) return false

    if (form.formState.isDirty) {
      const confirmed = window.confirm(
        "Os dados atuais do formulário serão substituídos pelos campos extraídos. Deseja continuar?",
      )

      if (!confirmed) return false
    }

    form.reset(mapExtractedLicitacaoToFormValues(extractionResult.licitacao))
    setAppliedExtraction({
      sessionId: extractionResult.sessionId,
      pdfFilename: extractionResult.metrics.pdfFilename,
      itemsExtracted: extractionResult.metrics.itemsExtracted,
      appliedAt: new Date().toISOString(),
    })
    setStage("form")

    return true
  }

  function handleResetForm() {
    if (form.formState.isDirty) {
      const confirmed = window.confirm("Deseja limpar todos os campos preenchidos deste formulário?")
      if (!confirmed) return
    }

    form.reset(createNovaLicitacaoDefaultValues())
  }

  function handleSkipUpload() {
    setStage("form")
  }

  function handleContinueManualFromUpload() {
    setStage("form")
  }

  async function handleRunCadastroAssistantExtraction() {
    if (!selectedDocument) {
      const error = new Error("Nenhum documento foi selecionado para iniciar a extração.")
      toast.error(error.message)
      throw error
    }

    if (selectedDocument.type !== "EDITAL") {
      const error = new Error("Selecione um documento do tipo edital para iniciar a extração com IA.")
      toast.error(error.message)
      throw error
    }

    if (!selectedDocument.documentId) {
      const error = new Error("O documento selecionado ainda não possui um identificador válido para a extração pós-embedding.")
      toast.error(error.message)
      throw error
    }

    await handleExtractDocument(selectedDocument.documentId)
  }

  return {
    stage,
    form,
    uploadDocument,
    deleteDocument,
    extraction,
    extractionResult,
    appliedExtraction,
    documents,
    selectedDocument,
    selectedDocumentId,
    primaryEditalDocument,
    draftContext,
    isWorkspaceModalOpen,
    setStage,
    setIsWorkspaceModalOpen,
    handleUploadDocument,
    handleDeleteDocument,
    handleSelectDocument,
    handleSkipUpload,
    handleContinueManualFromUpload,
    handleRunCadastroAssistantExtraction,
    handleApplyExtraction,
    handleResetForm,
  }
}
