"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import type {
  LicitacaoDraftSummary,
  LicitacaoWorkspaceResponse,
} from "../../../services/use-licitacao.service"
import { useLicitacaoService } from "../../../services/use-licitacao.service"
import type { LicitacaoDocumentItem } from "../../../types/licitacao-document"

type LicitacaoService = ReturnType<typeof useLicitacaoService>

type Props = {
  licitacaoService: LicitacaoService
  companyId: string | null
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

export function useLicitacaoDraftsPage({ licitacaoService, companyId }: Props) {
  const listDrafts = licitacaoService.listDrafts
  const getWorkspace = licitacaoService.getWorkspace
  const deleteDraft = licitacaoService.deleteDraft
  const [drafts, setDrafts] = useState<LicitacaoDraftSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [previewDraftId, setPreviewDraftId] = useState<string | null>(null)
  const [previewWorkspace, setPreviewWorkspace] = useState<LicitacaoWorkspaceResponse | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null)

  const loadDrafts = useCallback(async () => {
    if (!companyId) {
      setDrafts([])
      return
    }

    setIsLoading(true)

    try {
      const response = await listDrafts({ companyId })
      setDrafts(response.drafts)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Não foi possível carregar os rascunhos."))
    } finally {
      setIsLoading(false)
    }
  }, [companyId, listDrafts])

  useEffect(() => {
    void loadDrafts()
  }, [loadDrafts])

  const previewDocuments = useMemo<LicitacaoDocumentItem[]>(() => {
    return (previewWorkspace?.documents ?? []).map(document => ({
      localId: document.id,
      documentId: document.id,
      type: document.type,
      displayName: document.displayName || undefined,
      originalName: document.originalName,
      mimeType: document.mimeType,
      sizeBytes: document.sizeBytes,
      status: document.status === "READY" ? "READY" : document.status === "FAILED" ? "FAILED" : "PROCESSING",
      progressPercent: document.status === "READY" ? 100 : document.status === "FAILED" ? 100 : 0,
      message: document.status === "READY"
        ? "Documento pronto para leitura assistida."
        : document.status === "FAILED"
          ? "Falha no processamento do documento."
          : "Documento ainda está sendo processado.",
      previewUrl: document.previewUrl || undefined,
      documentUrl: document.documentUrl || undefined,
      previewUrlExpiresAt: document.previewUrlExpiresAt || undefined,
      uploadedAt: document.uploadedAt,
      file: null,
    }))
  }, [previewWorkspace])

  const selectedDocument = useMemo(() => {
    if (!previewDocuments.length) return null
    return previewDocuments.find(document => document.localId === selectedDocumentId) ?? previewDocuments[0]
  }, [previewDocuments, selectedDocumentId])

  const openPreview = useCallback(async (oportunidadeId: string) => {
    if (!companyId) return

    setPreviewDraftId(oportunidadeId)
    setIsPreviewLoading(true)
    setPreviewWorkspace(null)
    setSelectedDocumentId(null)

    try {
      const workspace = await getWorkspace({
        companyId,
        oportunidadeId,
      })

      setPreviewWorkspace(workspace)
      setSelectedDocumentId(
        workspace.documents.find(document => document.type === "EDITAL")?.id
          ?? workspace.documents[0]?.id
          ?? null,
      )
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Não foi possível abrir o workspace deste rascunho."))
      setPreviewDraftId(null)
    } finally {
      setIsPreviewLoading(false)
    }
  }, [companyId, getWorkspace])

  const closePreview = useCallback(() => {
    setPreviewDraftId(null)
    setPreviewWorkspace(null)
    setSelectedDocumentId(null)
  }, [])

  const deleteDraftById = useCallback(async (oportunidadeId: string) => {
    if (!companyId) return

    const draft = drafts.find(item => item.oportunidadeId === oportunidadeId)
    const draftLabel = draft?.draftPreview?.displayName ?? draft?.primaryDocumentName ?? "este rascunho"
    const confirmed = window.confirm(`Deseja excluir "${draftLabel}"? Essa ação remove o rascunho e os documentos vinculados.`)

    if (!confirmed) return

    setDeletingDraftId(oportunidadeId)

    try {
      const response = await deleteDraft({
        companyId,
        oportunidadeId,
      })

      if (previewDraftId === oportunidadeId) {
        closePreview()
      }

      toast.success(
        response.deletedDocuments > 0
          ? `Rascunho excluído com ${response.deletedDocuments} documento(s) removido(s).`
          : "Rascunho excluído com sucesso.",
      )

      await loadDrafts()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Não foi possível excluir o rascunho."))
    } finally {
      setDeletingDraftId(null)
    }
  }, [closePreview, companyId, deleteDraft, drafts, loadDrafts, previewDraftId])

  return {
    drafts,
    isLoading,
    isDeletePending: deletingDraftId !== null,
    deletingDraftId,
    reload: loadDrafts,
    previewDraftId,
    previewWorkspace,
    previewDocuments,
    selectedDocument,
    draftPreview: previewWorkspace?.oportunidade.draftPreview ?? previewWorkspace?.licitacao.draftPreview ?? null,
    isPreviewLoading,
    setSelectedDocumentId,
    openPreview,
    closePreview,
    deleteDraft: deleteDraftById,
  }
}
