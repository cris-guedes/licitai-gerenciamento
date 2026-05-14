"use client"

import { useMemo, useState } from "react"
import { CheckCircle2, ChevronsLeft, ChevronsRight, FileText, LoaderCircle, Sparkles, XCircle } from "lucide-react"
import { Badge } from "@/client/components/ui/badge"
import { Button } from "@/client/components/ui/button"
import { Skeleton } from "@/client/components/ui/skeleton"
import { DocumentSurface } from "@/client/components/document"
import { DocumentAiPanel } from "@/client/features/documents"
import type { DocumentWorkspaceProcessingState } from "@/client/features/documents/types/document-workspace"
import type { useDocumentChatService } from "@/client/features/licitacoes/services/use-document-chat.service"
import type { useDocumentSummaryService } from "@/client/features/licitacoes/services/use-document-summary.service"
import { WorkspacePanel } from "@/client/components/workspace"
import { cn } from "@/client/main/lib/utils"
import {
  describeAnalyses,
  formatBytes,
  formatDate,
  formatDocumentType,
  formatStatusLabel,
  getDocumentStatusClassName,
} from "../../lib/oportunidade-workspace"
import type { OportunidadeWorkspaceModel } from "../../types/oportunidade-workspace"

type DocumentChatService = ReturnType<typeof useDocumentChatService>
type DocumentSummaryService = ReturnType<typeof useDocumentSummaryService>

export function OportunidadeDocumentsModule({
  workspace,
  isLoading,
  errorMessage,
  documentChatService,
  documentSummaryService,
}: {
  workspace: OportunidadeWorkspaceModel | null
  isLoading: boolean
  errorMessage: string | null
  documentChatService: DocumentChatService
  documentSummaryService: DocumentSummaryService
}) {
  const documentCount = workspace?.documentsSummary.total ?? 0
  const documents = useMemo(() => workspace?.documents ?? [], [workspace?.documents])
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [listCollapsed, setListCollapsed] = useState(false)
  const [aiOpen, setAiOpen] = useState(true)
  const selectedDocument = documents.find(document => document.id === selectedDocumentId) ?? documents[0] ?? null
  const processingState = toProcessingState(selectedDocument?.status)

  return (
    <WorkspacePanel
      title="Documentos"
      description="Edital, anexos e materiais relacionados à oportunidade."
      actions={
        <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-600">
          {documentCount} documento{documentCount === 1 ? "" : "s"}
        </Badge>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      ) : errorMessage ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-700">
          {errorMessage}
        </div>
      ) : documents.length ? (
        <div className="flex min-h-[680px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white lg:flex-row">
          <aside
            className={cn(
              "min-h-0 shrink-0 border-b border-slate-200 bg-slate-50/55 transition-[width] duration-200 lg:border-b-0 lg:border-r",
              listCollapsed ? "lg:w-16" : "lg:w-80",
            )}
          >
            <div className="flex h-14 items-center justify-between gap-2 border-b border-slate-200 px-3">
              {!listCollapsed ? (
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Arquivos</p>
                  <p className="text-xs text-slate-500">{documents.length} documento{documents.length === 1 ? "" : "s"}</p>
                </div>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 rounded-lg"
                onClick={() => setListCollapsed(value => !value)}
                aria-label={listCollapsed ? "Expandir lista de documentos" : "Recolher lista de documentos"}
              >
                {listCollapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
              </Button>
            </div>

            <div className={cn("max-h-[626px] overflow-y-auto", listCollapsed ? "space-y-2 p-2" : "space-y-3 p-4")}>
              {documents.map(document => {
                const isActive = document.id === selectedDocument?.id

                return (
                  <button
                    key={document.id}
                    type="button"
                    onClick={() => setSelectedDocumentId(document.id)}
                    className={cn(
                      "flex w-full items-start rounded-lg border text-left transition-colors",
                      listCollapsed ? "min-h-10 justify-center px-2 py-2" : "min-h-[84px] gap-3 px-4 py-4",
                      isActive
                        ? "border-sky-200 bg-sky-50/80"
                        : "border-slate-200/80 bg-white hover:border-slate-300",
                    )}
                    title={document.displayName ?? document.originalName}
                  >
                    <div className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg",
                      isActive ? "bg-sky-100 text-primary" : "bg-slate-100 text-slate-700",
                    )}>
                      <FileText className="size-4" />
                    </div>

                    {!listCollapsed ? (
                      <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold leading-5 text-primary">
                            {document.displayName ?? document.originalName}
                          </p>
                          {document.displayName && document.displayName !== document.originalName ? (
                            <p className="mt-1 truncate text-xs text-slate-600">{document.originalName}</p>
                          ) : null}
                          <p className="mt-1.5 text-[11px] uppercase tracking-[0.12em] text-slate-500">
                            {formatDocumentType(document.type)} · {formatBytes(document.sizeBytes)}
                          </p>
                        </div>

                        <DocumentStatusIcon status={document.status} />
                      </div>

                      <p className="mt-2 truncate text-xs text-slate-500">{describeAnalyses(document)}</p>
                      {document.status === "PROCESSING" ? (
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                          <div className="h-full w-1/2 rounded-full bg-primary" />
                        </div>
                      ) : null}
                    </div>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </aside>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-primary">
                  {selectedDocument?.displayName ?? selectedDocument?.originalName ?? "Documento"}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {selectedDocument
                    ? `${formatDocumentType(selectedDocument.type)} · ${formatBytes(selectedDocument.sizeBytes)} · Atualizado em ${formatDate(selectedDocument.uploadedAt)}`
                    : "Selecione um documento"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {selectedDocument?.status === "READY" ? (
                  <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
                    <Sparkles className="mr-1 size-3" />
                    IA ativa
                  </Badge>
                ) : null}
                {selectedDocument ? <DocumentStatusIcon status={selectedDocument.status} /> : null}
              </div>
            </div>

            {selectedDocument?.previewUrl || selectedDocument?.documentUrl ? (
              <DocumentSurface
                url={selectedDocument.previewUrl || selectedDocument.documentUrl}
                title={selectedDocument.displayName ?? selectedDocument.originalName}
                className="min-h-[616px] flex-1"
              />
            ) : (
              <div className="flex min-h-[616px] flex-1 items-center justify-center px-6 text-center text-sm text-slate-500">
                Este documento ainda não possui URL de preview disponível.
              </div>
            )}
          </div>

          <div className="min-h-0 shrink-0 border-t border-slate-200 bg-white lg:border-l lg:border-t-0">
            <DocumentAiPanel
              open={aiOpen}
              onOpenChange={setAiOpen}
              documentId={selectedDocument?.id ?? null}
              documentChatService={documentChatService}
              documentSummaryService={documentSummaryService}
              processingState={processingState}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-500">
          Ainda não há documentos vinculados a esta oportunidade.
        </div>
      )}
    </WorkspacePanel>
  )
}

function toProcessingState(status: string | null | undefined): DocumentWorkspaceProcessingState {
  if (status === "READY" || status === "PROCESSING" || status === "FAILED") return status
  return "NOT_PROCESSED"
}

function DocumentStatusIcon({
  status,
}: {
  status: string
}) {
  if (status === "READY") return <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
  if (status === "FAILED") return <XCircle className="size-4 shrink-0 text-rose-600" />
  if (status === "PROCESSING") return <LoaderCircle className="size-4 shrink-0 animate-spin text-sky-600" />

  return (
    <span
      className={cn("inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold", getDocumentStatusClassName(status))}
    >
      {formatStatusLabel(status)}
    </span>
  )
}
