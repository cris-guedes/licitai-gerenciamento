"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { LoaderCircle } from "lucide-react"
import { DocumentAiPanel } from "@/client/features/documents"
import { useApp } from "@/client/hooks/app/useApp"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { AiWorkspaceBody } from "@/client/features/licitacoes/components/NovaLicitacaoPage/AiWorkspaceModal"
import { UploadEditalStep } from "@/client/features/licitacoes/components/NovaLicitacaoPage/UploadEditalStep"
import { useNovaLicitacaoPage } from "@/client/features/licitacoes/components/NovaLicitacaoPage/hooks/useNovaLicitacaoPage"
import { useDocumentChatService } from "@/client/features/licitacoes/services/use-document-chat.service"
import { useDocumentSummaryService } from "@/client/features/licitacoes/services/use-document-summary.service"
import { useLicitacaoService } from "@/client/features/licitacoes/services/use-licitacao.service"

export function AiWorkspacePage() {
  const searchParams = useSearchParams()
  const api = useCoreApi()
  const { empresaAtiva } = useApp()
  const licitacaoService = useLicitacaoService(api)
  const documentChatService = useDocumentChatService(api)
  const documentSummaryService = useDocumentSummaryService(api)
  const [isDocumentAssistantOpen, setIsDocumentAssistantOpen] = useState(true)
  const page = useNovaLicitacaoPage({
    licitacaoService,
    companyId: empresaAtiva?.id ?? null,
    initialOportunidadeId: searchParams.get("oportunidadeId"),
  })

  const selectedDocument = page.selectedDocument

  return (
    <div className="flex min-h-0 flex-1 flex-col pb-8">
      {page.isHydratingWorkspace ? (
        <div className="flex min-h-[62vh] items-center justify-center border border-slate-200 bg-white">
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            <LoaderCircle className="size-8 animate-spin text-primary" />
            <div className="space-y-1">
              <p className="text-lg font-semibold text-primary">Carregando Análise IA</p>
              <p className="text-sm text-muted-foreground">
                Restaurando documentos, análises e assistentes da oportunidade.
              </p>
            </div>
          </div>
        </div>
      ) : page.documents.length === 0 ? (
        <UploadEditalStep
          isPending={page.uploadDocument.isPending}
          error={page.uploadDocument.error}
          onUpload={page.handleUploadDocument}
        />
      ) : (
        <AiWorkspaceBody
          api={api}
          className="h-[calc(100vh-10rem)] min-h-[680px] border border-slate-200 shadow-sm"
          initialView="document"
          isUploadPending={page.uploadDocument.isPending}
          isExtractPending={page.extraction.isPending}
          isDeletePending={page.deleteDocument.isPending}
          documents={page.documents}
          selectedDocument={selectedDocument}
          selectedDocumentId={page.selectedDocumentId}
          extractionResult={page.extractionResult}
          extractionError={page.extraction.error}
          extractionProgress={page.extraction.progress}
          extractionPreview={page.extraction.preview}
          documentAssistantSidebar={
            <DocumentAiPanel
              open={isDocumentAssistantOpen}
              onOpenChange={setIsDocumentAssistantOpen}
              documentId={selectedDocument?.documentId ?? null}
              documentChatService={documentChatService}
              documentSummaryService={documentSummaryService}
              processingState={selectedDocument?.status === "FAILED" ? "FAILED" : selectedDocument?.status === "READY" ? "READY" : "PROCESSING"}
            />
          }
          onUpload={page.handleUploadDocument}
          onDeleteDocument={page.handleDeleteDocument}
          onSelectDocument={page.handleSelectDocument}
          onRunCadastroAssistantExtraction={page.handleRunCadastroAssistantExtraction}
          showApplyExtractionFooter={false}
        />
      )}
    </div>
  )
}
