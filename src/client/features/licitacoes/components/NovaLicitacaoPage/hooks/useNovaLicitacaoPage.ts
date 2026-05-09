"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { ExtractEditalDataResponse } from "@/client/main/infra/apis/api-core/models/ExtractEditalDataResponse"
import type {
  FinalizeOportunidadeRegistrationResponse,
  LicitacaoWorkspaceResponse,
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
  initialOportunidadeId?: string | null
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

function delay(ms: number) {
  return new Promise(resolve => window.setTimeout(resolve, ms))
}

function mapStreamStatus(status: "UPLOADING" | "PROCESSING" | "READY" | "FAILED"): LicitacaoDocumentProcessingStatus {
  return status
}

function createDocumentStatusMessage(status: LicitacaoWorkspaceResponse["documents"][number]["status"]) {
  if (status === "READY") return "Documento pronto para leitura assistida."
  if (status === "FAILED") return "Falha no processamento do documento."
  return "Documento ainda está sendo processado."
}

function mapWorkspaceDocumentStatus(status: LicitacaoWorkspaceResponse["documents"][number]["status"]): LicitacaoDocumentProcessingStatus {
  if (status === "READY") return "READY"
  if (status === "FAILED") return "FAILED"
  return "PROCESSING"
}

function buildSavedExtractionResult(
  analysis: LicitacaoWorkspaceResponse["documents"][number]["analyses"][number],
): ExtractEditalDataResponse | null {
  if (analysis.type !== "EXTRACT_EDITAL" || analysis.status !== "COMPLETED") return null

  const result = analysis.result as { sessionId?: string; licitacao?: ExtractEditalDataResponse["licitacao"] } | null
  const metrics = analysis.metrics as ExtractEditalDataResponse["metrics"] | null

  if (!result?.sessionId || !result.licitacao || !metrics) {
    return null
  }

  return {
    sessionId: result.sessionId,
    mdContent: analysis.markdownContent ?? "",
    licitacao: result.licitacao,
    metrics,
  }
}

export function useNovaLicitacaoPage({ licitacaoService, companyId, initialOportunidadeId }: Props) {
  const getWorkspace = licitacaoService.getWorkspace
  const form = useForm<NovaLicitacaoFormValues>({
    resolver: zodResolver(novaLicitacaoFormSchema),
    defaultValues: createNovaLicitacaoDefaultValues(),
  })

  const uploadDocument = licitacaoService.useUploadLicitacaoDocumentStream()
  const deleteDocument = licitacaoService.useDeleteLicitacaoDocument()
  const extraction = licitacaoService.useExtractEdital()
  const finalizeRegistration = licitacaoService.finalizeRegistration
  const resetExtraction = extraction.reset
  const [stage, setStage] = useState<"upload" | "form">("upload")
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false)
  const [extractionResult, setExtractionResult] = useState<ExtractEditalDataResponse | null>(null)
  const [appliedExtraction, setAppliedExtraction] = useState<AppliedExtraction | null>(null)
  const [draftContext, setDraftContext] = useState<LicitacaoDraftContext | null>(null)
  const [documents, setDocuments] = useState<LicitacaoDocumentItem[]>([])
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [savedExtractionResultsByDocumentId, setSavedExtractionResultsByDocumentId] = useState<Record<string, ExtractEditalDataResponse>>({})
  const [isHydratingWorkspace, setIsHydratingWorkspace] = useState(false)
  const [hydratedWorkspaceId, setHydratedWorkspaceId] = useState<string | null>(null)
  const [isSubmittingRegistration, setIsSubmittingRegistration] = useState(false)
  const [submitRegistrationError, setSubmitRegistrationError] = useState<string | null>(null)

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

  useEffect(() => {
    if (extraction.isPending) return

    const activeLocalId = selectedDocumentId ?? documents[0]?.localId ?? null

    if (!activeLocalId) {
      setExtractionResult(null)
      return
    }

    setExtractionResult(savedExtractionResultsByDocumentId[activeLocalId] ?? null)
  }, [documents, extraction.isPending, savedExtractionResultsByDocumentId, selectedDocumentId])

  const hydrateWorkspace = useCallback(async (oportunidadeId: string) => {
    if (!companyId) return

    setHydratedWorkspaceId(oportunidadeId)
    setIsHydratingWorkspace(true)
    resetExtraction()
    setExtractionResult(null)
    setAppliedExtraction(null)

    try {
      const workspace = await getWorkspace({
        companyId,
        oportunidadeId,
      })

      const restoredDocuments: LicitacaoDocumentItem[] = workspace.documents.map(document => ({
        localId: document.id,
        documentId: document.id,
        type: document.type,
        displayName: document.displayName || undefined,
        originalName: document.originalName,
        mimeType: document.mimeType,
        sizeBytes: document.sizeBytes,
        status: mapWorkspaceDocumentStatus(document.status),
        progressPercent: document.status === "READY" ? 100 : document.status === "FAILED" ? 100 : 0,
        message: createDocumentStatusMessage(document.status),
        previewUrl: document.previewUrl || undefined,
        documentUrl: document.documentUrl || undefined,
        previewUrlExpiresAt: document.previewUrlExpiresAt || undefined,
        uploadedAt: document.uploadedAt,
        file: null,
      }))

      const restoredExtractionResults = restoredDocuments.reduce<Record<string, ExtractEditalDataResponse>>((acc, document) => {
        const workspaceDocument = workspace.documents.find(item => item.id === document.documentId)
        const analysis = workspaceDocument?.analyses.find(item => item.type === "EXTRACT_EDITAL")
        const savedResult = analysis ? buildSavedExtractionResult(analysis) : null

        if (savedResult) {
          acc[document.localId] = savedResult
        }

        return acc
      }, {})

      const selectedLocalId = restoredDocuments.find(document => document.type === "EDITAL")?.localId
        ?? restoredDocuments[0]?.localId
        ?? null

      setDraftContext({
        oportunidadeId: workspace.oportunidade.id,
        oportunidadeStatus: workspace.oportunidade.status,
        licitacaoId: workspace.licitacao.id,
        licitacaoStatus: workspace.licitacao.status,
        editalId: workspace.edital?.id,
        editalStatus: workspace.edital?.status ?? null,
      })
      setDocuments(restoredDocuments)
      setSavedExtractionResultsByDocumentId(restoredExtractionResults)
      setSelectedDocumentId(selectedLocalId)
      setExtractionResult(selectedLocalId ? restoredExtractionResults[selectedLocalId] ?? null : null)
      setStage("form")
      setIsWorkspaceModalOpen(restoredDocuments.length > 0)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Não foi possível recuperar o workspace da licitação."))
    } finally {
      setIsHydratingWorkspace(false)
    }
  }, [companyId, getWorkspace, resetExtraction])

  useEffect(() => {
    if (!initialOportunidadeId || !companyId) return
    if (hydratedWorkspaceId === initialOportunidadeId) return

    void hydrateWorkspace(initialOportunidadeId)
  }, [companyId, hydrateWorkspace, hydratedWorkspaceId, initialOportunidadeId])

  function updateDocument(localId: string, updater: (current: LicitacaoDocumentItem) => LicitacaoDocumentItem) {
    setDocuments(prev => prev.map(document => (document.localId === localId ? updater(document) : document)))
  }

  function applyUploadEvent(localId: string, file: File, documentType: LicitacaoDocumentType, event: UploadLicitacaoDocumentEvent) {
    if (event.type === "progress") {
      const context = event.context

      if (context) {
        setDraftContext(prev => prev ?? {
          oportunidadeId: context.oportunidadeId,
          oportunidadeStatus: "DRAFT",
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
        oportunidadeId: event.result.oportunidadeId,
        oportunidadeStatus: event.result.oportunidadeStatus,
        licitacaoId: event.result.licitacaoId,
        licitacaoStatus: event.result.licitacaoStatus,
        editalId: event.result.editalId,
        editalStatus: event.result.editalStatus,
      })

      updateDocument(localId, () => ({
        localId,
        documentId: event.result.documentId,
        type: event.result.documentType,
        displayName: event.result.displayName || undefined,
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
      displayName: replacingDocument?.displayName,
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
    setSavedExtractionResultsByDocumentId(prev => {
      if (!replaceDocumentLocalId) return prev

      const next = { ...prev }
      delete next[replaceDocumentLocalId]
      return next
    })
    setExtractionResult(null)
    extraction.reset()
    setStage("form")
    setIsWorkspaceModalOpen(true)

    try {
      const result = await uploadDocument.mutateAsync({
        file,
        companyId,
        documentType,
        oportunidadeId: draftContext?.oportunidadeId,
        editalId: draftContext?.editalId ?? undefined,
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
      setSavedExtractionResultsByDocumentId(prev => {
        const next = { ...prev }
        delete next[localId]
        return next
      })
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
      extraction.reset()
    }

    setSelectedDocumentId(localId)
    setExtractionResult(savedExtractionResultsByDocumentId[localId] ?? null)
  }

  async function tryRecoverExtractionFromWorkspace(localId: string, documentId: string) {
    if (!companyId || !draftContext?.oportunidadeId) return null

    const maxAttempts = 3

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const workspace = await getWorkspace({
        companyId,
        oportunidadeId: draftContext.oportunidadeId,
      }).catch(() => null)

      if (!workspace) {
        if (attempt < maxAttempts - 1) {
          await delay(1200)
        }
        continue
      }

      const workspaceDocument = workspace.documents.find(document => document.id === documentId)
      const analysis = workspaceDocument?.analyses.find(item => item.type === "EXTRACT_EDITAL")
      const savedResult = analysis ? buildSavedExtractionResult(analysis) : null

      if (savedResult) {
        extraction.reset()
        setSavedExtractionResultsByDocumentId(prev => ({
          ...prev,
          [localId]: savedResult,
        }))
        setExtractionResult(current => {
          if (selectedDocumentId && selectedDocumentId !== localId) return current
          return savedResult
        })

        return savedResult
      }

      if (attempt < maxAttempts - 1) {
        await delay(1200)
      }
    }

    return null
  }

  async function handleExtractDocument(documentId: string, localId: string) {
    if (!companyId) {
      throw new Error("Nenhuma empresa ativa selecionada para vincular este documento.")
    }

    setExtractionResult(null)

    try {
      const result = await extraction.mutateAsync({ companyId, documentId })
      setSavedExtractionResultsByDocumentId(prev => ({
        ...prev,
        [localId]: result,
      }))
      setExtractionResult(result)
      return
    } catch (error: unknown) {
      const recoveredResult = await tryRecoverExtractionFromWorkspace(localId, documentId)

      if (recoveredResult) {
        toast.success("A extração foi recuperada do workspace após uma instabilidade na conexão.")
        return
      }

      throw error
    }
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

    await handleExtractDocument(selectedDocument.documentId, selectedDocument.localId)
  }

  async function handleSubmitRegistration(values: NovaLicitacaoFormValues): Promise<FinalizeOportunidadeRegistrationResponse> {
    if (!companyId) {
      throw new Error("Nenhuma empresa ativa selecionada para concluir o cadastro.")
    }

    setIsSubmittingRegistration(true)
    setSubmitRegistrationError(null)

    try {
      const result = await finalizeRegistration({
        companyId,
        oportunidadeId: draftContext?.oportunidadeId,
        form: values,
      })

      setDraftContext({
        oportunidadeId: result.oportunidadeId,
        oportunidadeStatus: result.oportunidadeStatus,
        licitacaoId: result.licitacaoId,
        licitacaoStatus: result.licitacaoStatus,
        editalId: result.editalId,
        editalStatus: result.editalStatus,
      })

      toast.success("Cadastro da oportunidade concluído com sucesso.")
      return result
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Não foi possível concluir o cadastro da oportunidade.")
      setSubmitRegistrationError(message)
      toast.error(message)
      throw error
    } finally {
      setIsSubmittingRegistration(false)
    }
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
    isSubmittingRegistration,
    submitRegistrationError,
    isHydratingWorkspace,
    isWorkspaceModalOpen,
    setStage,
    setIsWorkspaceModalOpen,
    handleUploadDocument,
    handleDeleteDocument,
    handleSelectDocument,
    handleSkipUpload,
    handleContinueManualFromUpload,
    handleRunCadastroAssistantExtraction,
    handleSubmitRegistration,
    handleApplyExtraction,
    handleResetForm,
  }
}
