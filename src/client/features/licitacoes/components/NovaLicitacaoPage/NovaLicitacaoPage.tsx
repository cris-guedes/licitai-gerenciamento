"use client"

import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/client/components/ui/button"
import { DocumentAiPanel } from "@/client/features/documents"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { DashboardHeaderActions } from "@/client/features/dashboard/components/DashboardShell"
import { useApp } from "@/client/hooks/app/useApp"
import { Gavel, LoaderCircle, ScanSearch, ShieldAlert, Sparkles, Wrench } from "lucide-react"
import { cn } from "@/client/main/lib/utils"
import { AiWorkspaceModal, type WorkspaceView } from "./AiWorkspaceModal"
import { NovaLicitacaoForm } from "./NovaLicitacaoForm"
import { UploadEditalStep } from "./UploadEditalStep"
import { useNovaLicitacaoPage } from "./hooks/useNovaLicitacaoPage"
import type { NovaLicitacaoFormValues } from "../../schemas/nova-licitacao.schema"
import { useDocumentChatService } from "../../services/use-document-chat.service"
import { useDocumentSummaryService } from "../../services/use-document-summary.service"
import { useLicitacaoService } from "../../services/use-licitacao.service"

export function NovaLicitacaoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const api = useCoreApi()
  const { empresaAtiva, orgAtiva } = useApp()
  const licitacaoService = useLicitacaoService(api)
  const documentChatService = useDocumentChatService(api)
  const documentSummaryService = useDocumentSummaryService(api)
  const page = useNovaLicitacaoPage({
    licitacaoService,
    companyId: empresaAtiva?.id ?? null,
    initialOportunidadeId: searchParams.get("oportunidadeId"),
  })
  const [isDocumentAssistantOpen, setIsDocumentAssistantOpen] = useState(true)
  const [workspaceInitialView, setWorkspaceInitialView] = useState<WorkspaceView>("document")
  const { handleResetForm, setIsWorkspaceModalOpen, setStage } = page
  const base = orgAtiva?.id && empresaAtiva?.id ? `/org/${orgAtiva.id}/${empresaAtiva.id}` : null
  const canOpenWorkspace = page.documents.length > 0

  async function handleSubmitRegistration(values: NovaLicitacaoFormValues) {
    const result = await page.handleSubmitRegistration(values)

    if (base) {
      router.replace(`${base}/licitacoes?oportunidadeId=${result.oportunidadeId}`)
    }

    return result
  }

  const workspaceModal = (
    <AiWorkspaceModal
      api={api}
      open={page.isWorkspaceModalOpen}
      onOpenChange={setIsWorkspaceModalOpen}
      initialView={workspaceInitialView}
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
        <DocumentAiPanel
          open={isDocumentAssistantOpen}
          onOpenChange={setIsDocumentAssistantOpen}
          documentId={page.selectedDocument?.documentId ?? null}
          documentChatService={documentChatService}
          documentSummaryService={documentSummaryService}
          processingState={page.selectedDocument?.status === "FAILED" ? "FAILED" : page.selectedDocument?.status === "READY" ? "READY" : "PROCESSING"}
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
      setWorkspaceInitialView("document")
      setStage("form")
      setIsWorkspaceModalOpen(true)
      return
    }

    setStage("upload")
  }

  function handleOpenAssistant(view: WorkspaceView) {
    if (!canOpenWorkspace) {
      setStage("upload")
      return
    }

    setWorkspaceInitialView(view)
    setStage("form")
    setIsWorkspaceModalOpen(true)
  }

  const assistantOptions: Array<{
    id: string
    title: string
    description: string
    icon: LucideIcon
    disabled?: boolean
    view?: WorkspaceView
  }> = [
    {
      id: "assistant-cadastro",
      title: "Assistente de cadastro",
      description: "Extrai os dados do edital para o formulário.",
      icon: ScanSearch,
      view: "assistant-cadastro",
    },
    {
      id: "assistant-riscos",
      title: "Assistente de riscos",
      description: "Mapeia alertas e pontos de atenção do processo.",
      icon: ShieldAlert,
      disabled: true,
    },
    {
      id: "assistant-juridico",
      title: "Assistente jurídico",
      description: "Revisa cláusulas, obrigações e inconsistências.",
      icon: Gavel,
      disabled: true,
    },
    {
      id: "assistant-tecnico",
      title: "Assistente técnico",
      description: "Avalia escopo, requisitos e execução técnica.",
      icon: Wrench,
      disabled: true,
    },
  ]

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

      {page.isHydratingWorkspace ? (
        <div className="flex min-h-[60vh] items-center justify-center rounded-none border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            <LoaderCircle className="size-8 animate-spin text-primary" />
            <div className="space-y-1">
              <p className="text-lg font-semibold text-primary">Recuperando workspace da licitação</p>
              <p className="text-sm text-muted-foreground">
                Restaurando documentos, análises e assistentes vinculados ao processo em andamento.
              </p>
            </div>
          </div>
        </div>
      ) : page.stage === "upload" && page.documents.length === 0 ? (
        <UploadEditalStep
          isPending={page.uploadDocument.isPending}
          error={page.uploadDocument.error}
          onUpload={page.handleUploadDocument}
          onSkip={page.handleSkipUpload}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-none border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="grid gap-3 px-4 py-4 sm:grid-cols-2 xl:grid-cols-5">
                {assistantOptions.map(option => {
                  const Icon = option.icon

                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={option.disabled}
                      onClick={() => option.view && handleOpenAssistant(option.view)}
                      className={cn(
                        "relative flex h-full min-h-[88px] items-center gap-3 rounded-none border px-4 py-3 text-left transition-colors",
                        option.disabled
                          ? "cursor-not-allowed border-slate-200 bg-slate-50/80 opacity-75"
                          : "border-sky-200/80 bg-sky-50/60 hover:border-sky-300 hover:bg-sky-50",
                      )}
                    >
                      <div
                        className={cn(
                          "absolute right-3 top-3 flex size-5 items-center justify-center rounded-full border",
                          option.disabled
                            ? "border-slate-200 bg-white text-slate-400"
                            : "border-sky-200 bg-white text-primary",
                        )}
                      >
                        <Sparkles className="size-3" />
                      </div>
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-full",
                          option.disabled ? "bg-white text-slate-500" : "bg-white text-primary",
                        )}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-primary">{option.title}</p>
                        <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{option.description}</p>
                      </div>
                    </button>
                  )
                })}
              <Button
                type="button"
                size="lg"
                className="h-full min-h-[88px] rounded-none"
                onClick={handleWorkspaceAction}
              >
                <Sparkles className="mr-2 size-4" />
                {canOpenWorkspace ? "Abrir workspace da IA" : "Habilitar ferramentas de IA"}
              </Button>
            </div>
          </div>

          <NovaLicitacaoForm
            form={page.form}
            onSubmit={handleSubmitRegistration}
            knownOrgaos={page.knownOrgaos}
            isLoadingKnownOrgaos={page.isLoadingKnownOrgaos}
            isSubmitting={page.isSubmittingRegistration}
            submitError={page.submitRegistrationError}
            isCompleted={page.draftContext?.oportunidadeStatus === "ACTIVE"}
          />
        </div>
      )}
      {workspaceModal}
    </div>
  )
}
