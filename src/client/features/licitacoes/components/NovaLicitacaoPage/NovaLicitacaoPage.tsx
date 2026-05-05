"use client"

import { useState } from "react"
import { Button } from "@/client/components/ui/button"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { DashboardHeaderActions } from "@/client/features/dashboard/components/DashboardShell"
import { useApp } from "@/client/hooks/app/useApp"
import { Bot } from "lucide-react"
import { AiWorkspaceModal } from "./AiWorkspaceModal"
import { DocumentAssistantSidebar } from "./DocumentAssistantSidebar"
import { NovaLicitacaoForm } from "./NovaLicitacaoForm"
import { UploadEditalStep } from "./UploadEditalStep"
import { useNovaLicitacaoPage } from "./hooks/useNovaLicitacaoPage"
import { useDocumentChatService } from "../../services/use-document-chat.service"
import { useDocumentSummaryService } from "../../services/use-document-summary.service"
import { useLicitacaoService } from "../../services/use-licitacao.service"

export function NovaLicitacaoPage() {
  const api = useCoreApi()
  const { empresaAtiva } = useApp()
  const licitacaoService = useLicitacaoService(api)
  const documentChatService = useDocumentChatService(api)
  const documentSummaryService = useDocumentSummaryService(api)
  const page = useNovaLicitacaoPage({ licitacaoService, companyId: empresaAtiva?.id ?? null })
  const [isDocumentAssistantOpen, setIsDocumentAssistantOpen] = useState(true)
  const { handleResetForm, setIsWorkspaceModalOpen, setStage } = page
  const canOpenWorkspace = page.documents.length > 0

  const workspaceModal = (
    <AiWorkspaceModal
      open={page.isWorkspaceModalOpen}
      onOpenChange={setIsWorkspaceModalOpen}
      isUploadPending={page.uploadDocument.isPending}
      isExtractPending={page.extraction.isPending}
      isDeletePending={page.deleteDocument.isPending}
      documents={page.documents}
      selectedDocument={page.selectedDocument}
      selectedDocumentId={page.selectedDocumentId}
      extractionResult={page.extractionResult}
      extractionError={page.extraction.error}
      extractionProgress={page.extraction.progress}
      extractionPreview={page.extraction.preview}
      documentAssistantSidebar={(
        <DocumentAssistantSidebar
          open={isDocumentAssistantOpen}
          onOpenChange={setIsDocumentAssistantOpen}
          documentId={page.selectedDocument?.documentId ?? null}
          documentChatService={documentChatService}
          documentSummaryService={documentSummaryService}
        />
      )}
      onUpload={page.handleUploadDocument}
      onDeleteDocument={page.handleDeleteDocument}
      onSelectDocument={page.handleSelectDocument}
      onRunCadastroAssistantExtraction={page.handleRunCadastroAssistantExtraction}
      onApplyExtraction={page.handleApplyExtraction}
    />
  )

  function handleWorkspaceAction() {
    if (canOpenWorkspace) {
      setStage("form")
      setIsWorkspaceModalOpen(true)
      return
    }

    setStage("upload")
  }

  return (
    <div className="mx-auto flex w-full max-w-[1720px] min-h-0 flex-1 flex-col gap-4 pt-4 md:pt-5 pb-10">
      <DashboardHeaderActions>
        {page.stage === "form" && (
          <Button
            type="button"
            variant="ghost"
            onClick={handleResetForm}
            className="px-3 text-[13px] text-secondary hover:text-secondary"
          >
            Limpar formulário
          </Button>
        )}
      </DashboardHeaderActions>

      {page.stage === "upload" && page.documents.length === 0 ? (
        <UploadEditalStep
          isPending={page.uploadDocument.isPending}
          error={page.uploadDocument.error}
          onUpload={page.handleUploadDocument}
          onSkip={page.handleSkipUpload}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-none border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <Button
                type="button"
                size="lg"
                className="min-w-44 rounded-none"
                onClick={handleWorkspaceAction}
              >
                <Bot className="mr-2 size-4" />
                {canOpenWorkspace ? "Abrir workspace da IA" : "Enviar documento"}
              </Button>
            </div>
          </div>

          <NovaLicitacaoForm form={page.form} />
        </div>
      )}
      {workspaceModal}
    </div>
  )
}
