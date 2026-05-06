"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { FileText, LoaderCircle, Trash2 } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog"
import { cn } from "@/client/main/lib/utils"
import type { LicitacaoDraftPreview } from "../../services/use-licitacao.service"
import type { LicitacaoDocumentItem } from "../../types/licitacao-document"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading: boolean
  documents: LicitacaoDocumentItem[]
  selectedDocument: LicitacaoDocumentItem | null
  onSelectDocument: (localId: string) => void
  continueHref: string
  draftPreview?: LicitacaoDraftPreview | null
  isDeletePending?: boolean
  onDeleteDraft?: () => void
  assistantSidebar?: ReactNode
}

export function LicitacaoDraftPreviewDialog({
  open,
  onOpenChange,
  isLoading,
  documents,
  selectedDocument,
  onSelectDocument,
  continueHref,
  draftPreview,
  isDeletePending = false,
  onDeleteDraft,
  assistantSidebar,
}: Props) {
  const previewSourceUrl = selectedDocument?.previewUrl ?? null
  const selectedDocumentTitle = selectedDocument?.displayName ?? selectedDocument?.originalName ?? "Rascunho em andamento"
  const previewMetaLine = selectedDocument?.documentId === draftPreview?.sourceDocumentId
    ? [draftPreview?.modalidade, draftPreview?.numero, draftPreview?.orgaoNome].filter(Boolean).join(" · ")
    : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-[90vh] max-w-none overflow-hidden border-0 bg-white p-0 shadow-[0_30px_80px_rgba(4,22,39,0.18)]"
        style={{
          width: "min(1540px, calc(100vw - 3rem))",
          maxWidth: "min(1540px, calc(100vw - 3rem))",
        }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Workspace do rascunho</DialogTitle>
          <DialogDescription>
            Revise o contexto do rascunho e continue o cadastro da licitação.
          </DialogDescription>
        </DialogHeader>

        <div className="grid h-full min-h-0 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-slate-50/55">
            <div className="border-b border-slate-200 px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Documentos do rascunho
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {documents.length === 1 ? "1 documento recuperado" : `${documents.length} documentos recuperados`}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div className="space-y-3">
                {documents.map(document => {
                  const isActive = document.localId === selectedDocument?.localId
                  const documentTitle = document.displayName ?? document.originalName

                  return (
                    <button
                      key={document.localId}
                      type="button"
                      onClick={() => onSelectDocument(document.localId)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border px-4 py-4 text-left transition-colors",
                        isActive
                          ? "border-sky-200 bg-sky-50/80"
                          : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50",
                      )}
                    >
                      <div className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-lg",
                        isActive ? "bg-sky-100 text-primary" : "bg-slate-100 text-slate-700",
                      )}>
                        <FileText className="size-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-primary">{documentTitle}</p>
                        {document.displayName && document.displayName !== document.originalName ? (
                          <p className="mt-1 truncate text-xs text-slate-600">{document.originalName}</p>
                        ) : null}
                        <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-slate-500">
                          {document.type} · {formatBytes(document.sizeBytes)}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>

          <div className="flex min-h-0 flex-col bg-white">
            <div className="border-b border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.95)_0%,rgba(255,255,255,1)_100%)] px-6 py-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace do rascunho</p>
              <p className="mt-3 truncate text-[1.45rem] font-semibold tracking-[-0.03em] text-primary">
                {selectedDocumentTitle}
              </p>
              {previewMetaLine ? (
                <p className="mt-2 truncate text-sm text-slate-700">{previewMetaLine}</p>
              ) : null}
              <p className="mt-2 text-sm text-muted-foreground">
                Revise os documentos e, quando quiser seguir, continue o cadastro com o contexto da IA já restaurado.
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              {isLoading ? (
                <div className="flex h-full items-center justify-center bg-slate-50/70 px-6">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <LoaderCircle className="size-8 animate-spin text-primary" />
                    <p className="text-base font-semibold text-primary">Abrindo workspace do rascunho</p>
                  </div>
                </div>
              ) : selectedDocument?.status === "READY" && previewSourceUrl ? (
                <div className="flex h-full min-h-0 overflow-hidden bg-white">
                  <div className="min-h-0 flex-1 overflow-hidden">
                    <iframe
                      title={selectedDocumentTitle}
                      src={previewSourceUrl}
                      className="h-full w-full border-0"
                      allow="fullscreen"
                    />
                  </div>
                  {assistantSidebar ?? null}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-50/70 px-6">
                  <div className="max-w-lg text-center">
                    <p className="text-lg font-semibold text-primary">Documento ainda não está pronto para preview</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {selectedDocument?.message ?? "Selecione um documento para visualizar o contexto deste rascunho."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="border-t border-slate-200 bg-white px-6 py-4">
              {onDeleteDraft ? (
                <Button
                  type="button"
                  variant="outline"
                  className="mr-auto text-destructive hover:text-destructive"
                  disabled={isDeletePending}
                  onClick={onDeleteDraft}
                >
                  {isDeletePending ? (
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 size-4" />
                  )}
                  Excluir rascunho
                </Button>
              ) : null}
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              <Button asChild>
                <Link href={continueHref}>Continuar</Link>
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
