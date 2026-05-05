"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import {
  AlertCircle,
  CheckCircle2,
  CirclePlus,
  FileText,
  LoaderCircle,
  RefreshCcw,
  ScanSearch,
  Trash2,
  XCircle,
} from "lucide-react"
import { Button } from "@/client/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select"
import { cn } from "@/client/main/lib/utils"
import type { ExtractEditalDataResponse } from "@/client/main/infra/apis/api-core/models/ExtractEditalDataResponse"
import type { LicitacaoDocumentItem } from "../../types/licitacao-document"
import type {
  ExtractionProgressState,
  LicitacaoDocumentType,
  PartialExtractionPreview,
} from "../../services/use-licitacao.service"
import { CadastroAssistantPanel } from "./CadastroAssistantPanel"

const MAX_FILE_SIZE_MB = 50

const DOCUMENT_TYPE_OPTIONS: Array<{ value: LicitacaoDocumentType; label: string; helper: string }> = [
  { value: "EDITAL", label: "Edital", helper: "Documento principal do processo licitatório." },
  { value: "ANEXO", label: "Anexo", helper: "Memorial, planilha, cronograma e documentos auxiliares." },
  { value: "OUTRO", label: "Outro", helper: "Arquivos complementares que não entram nas categorias acima." },
]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isUploadPending: boolean
  isExtractPending: boolean
  isDeletePending: boolean
  documents: LicitacaoDocumentItem[]
  selectedDocument: LicitacaoDocumentItem | null
  selectedDocumentId: string | null
  extractionResult: ExtractEditalDataResponse | null
  extractionError: Error | null
  extractionProgress: ExtractionProgressState
  extractionPreview: PartialExtractionPreview
  documentAssistantSidebar?: ReactNode
  onUpload: (params: {
    file: File
    documentType: LicitacaoDocumentType
    replaceDocumentLocalId?: string
  }) => Promise<unknown>
  onDeleteDocument: (localId: string) => Promise<void>
  onSelectDocument: (localId: string) => void
  onRunCadastroAssistantExtraction: () => Promise<void>
  onApplyExtraction: () => boolean
}

type UploadDialogState = {
  open: boolean
  mode: "add" | "replace"
  targetDocumentLocalId?: string
}

type WorkspaceView = "document" | "assistant-cadastro"

export function AiWorkspaceModal({
  open,
  onOpenChange,
  isUploadPending,
  isExtractPending,
  isDeletePending,
  documents,
  selectedDocument,
  selectedDocumentId,
  extractionResult,
  extractionError,
  extractionProgress,
  extractionPreview,
  documentAssistantSidebar,
  onUpload,
  onDeleteDocument,
  onSelectDocument,
  onRunCadastroAssistantExtraction,
  onApplyExtraction,
}: Props) {
  const [dialogState, setDialogState] = useState<UploadDialogState>({ open: false, mode: "add" })
  const [dialogDocumentType, setDialogDocumentType] = useState<LicitacaoDocumentType>("ANEXO")
  const [dialogFile, setDialogFile] = useState<File | null>(null)
  const [activeView, setActiveView] = useState<WorkspaceView>("document")

  const previewSourceUrl = useMemo(() => {
    if (selectedDocument?.previewUrl) return selectedDocument.previewUrl
    if (!selectedDocument?.file) return null
    return URL.createObjectURL(selectedDocument.file)
  }, [selectedDocument])

  useEffect(() => {
    return () => {
      if (previewSourceUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewSourceUrl)
      }
    }
  }, [previewSourceUrl])

  const documentsCountLabel =
    documents.length === 1 ? "1 arquivo carregado" : `${documents.length} arquivos carregados`

  const isCadastroAssistantActive = activeView === "assistant-cadastro"
  async function handleSubmitDialog() {
    if (!dialogFile) return

    const file = dialogFile
    const documentType = dialogDocumentType
    const replaceDocumentLocalId = dialogState.mode === "replace" ? dialogState.targetDocumentLocalId : undefined

    setDialogState({ open: false, mode: "add" })
    setDialogFile(null)

    await onUpload({
      file,
      documentType,
      replaceDocumentLocalId,
    })
  }

  function openAddDialog() {
    setDialogDocumentType("ANEXO")
    setDialogFile(null)
    setDialogState({ open: true, mode: "add" })
  }

  function openReplaceDialog() {
    if (!selectedDocument) return
    setDialogDocumentType(selectedDocument.type)
    setDialogFile(null)
    setDialogState({ open: true, mode: "replace", targetDocumentLocalId: selectedDocument.localId })
  }

  useEffect(() => {
    if (!open || documents.length > 0) return
    setActiveView("document")
  }, [documents.length, open])

  function handleSelectDocumentView(localId: string) {
    onSelectDocument(localId)
    setActiveView("document")
  }

  const selectedDocumentTypeMeta = DOCUMENT_TYPE_OPTIONS.find(option => option.value === selectedDocument?.type)
  const sectionLabel = isCadastroAssistantActive ? "Assistentes" : "Documentos"
  const sectionTitle = isCadastroAssistantActive
    ? "Assistente de cadastro"
    : selectedDocument?.originalName ?? "Selecione um documento"
  const sectionDescription = isCadastroAssistantActive
    ? "Extraia dados estruturados do edital e acompanhe a revisão em tempo real."
    : `${selectedDocumentTypeMeta?.label ?? "Documento"} · ${formatBytes(selectedDocument?.sizeBytes ?? 0)}`

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="h-[92vh] max-w-none overflow-hidden border-0 bg-white p-0 shadow-[0_30px_80px_rgba(4,22,39,0.18)]"
          style={{
            width: "min(1580px, calc(100vw - 3rem))",
            maxWidth: "min(1580px, calc(100vw - 3rem))",
          }}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Workspace da IA</DialogTitle>
            <DialogDescription>
              Gerencie documentos, abra assistentes especialistas e acompanhe o processamento do edital.
            </DialogDescription>
          </DialogHeader>

          <div className="grid h-full min-h-0 gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-slate-50/55">
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
                <section>
                  <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Assistentes IA
                  </p>

                  <div className="mt-4 space-y-3">
                    <button
                      type="button"
                      onClick={() => setActiveView("assistant-cadastro")}
                      className={cn(
                        "flex min-h-[84px] w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-colors",
                        isCadastroAssistantActive
                          ? "border-sky-200 bg-sky-50/80 text-primary"
                          : "border-slate-200/80 bg-white/90 text-primary hover:border-slate-300 hover:bg-white",
                      )}
                    >
                      <div
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg",
                          isCadastroAssistantActive ? "bg-sky-100 text-primary" : "bg-slate-100 text-primary",
                        )}
                      >
                        <ScanSearch className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold leading-5">Assistente de cadastro</p>
                        <p
                          className={cn(
                              "mt-1 text-xs leading-5",
                            "text-muted-foreground",
                          )}
                        >
                          Extrai dados do edital
                        </p>
                      </div>
                    </button>
                  </div>
                </section>

                <section className="mt-10">
                  <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Documentos relacionados
                  </p>
                  <p className="px-1 pt-2 text-sm text-muted-foreground">{documentsCountLabel}</p>

                  <div className="mt-4 space-y-3">
                    {documents.map(document => {
                      const isSelectedDocument = document.localId === selectedDocumentId
                      const isActiveCard = activeView === "document" && isSelectedDocument

                      return (
                        <button
                          key={document.localId}
                          type="button"
                          onClick={() => handleSelectDocumentView(document.localId)}
                          className={cn(
                            "flex min-h-[84px] w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-colors",
                            isActiveCard
                              ? "border-sky-200 bg-sky-50/80"
                              : "border-slate-200/80 bg-white/90 hover:border-slate-300 hover:bg-white",
                          )}
                        >
                          <div
                            className={cn(
                              "flex size-10 shrink-0 items-center justify-center rounded-lg",
                              isActiveCard ? "bg-sky-100 text-primary" : "bg-slate-100 text-slate-700",
                            )}
                          >
                            <FileText className="size-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[14px] font-semibold leading-5 text-primary">{document.originalName}</p>
                                <p className="mt-1.5 text-[11px] uppercase tracking-[0.12em] text-slate-500">
                                  {formatDocumentType(document.type)} · {formatBytes(document.sizeBytes)}
                                </p>
                              </div>
                              <div className="shrink-0 pt-0.5">{renderDocumentStatusIcon(document.status)}</div>
                            </div>

                            {shouldShowDocumentProgress(document.status) ? (
                              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className="h-full rounded-full bg-primary transition-[width]"
                                  style={{ width: `${getDocumentProgressValue(document)}%` }}
                                />
                              </div>
                            ) : null}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </section>
              </div>

              <div className="shrink-0 border-t border-slate-200/80 px-5 py-4">
                <Button
                  type="button"
                  className="h-12 w-full rounded-xl text-sm font-semibold shadow-[0_12px_30px_rgba(37,99,235,0.18)]"
                  onClick={openAddDialog}
                >
                  <CirclePlus className="mr-2 size-4" />
                  Novo Documento
                </Button>
              </div>
            </aside>

            <div className="flex min-h-0 flex-1 flex-col bg-white">
              <div className="flex min-h-36 flex-col gap-5 border-b border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.95)_0%,rgba(255,255,255,1)_100%)] px-6 py-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
                    {sectionLabel}
                  </div>
                  <p className="mt-3 truncate text-[1.55rem] font-semibold tracking-[-0.03em] text-primary">
                    {sectionTitle}
                  </p>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                    {sectionDescription}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end sm:self-center">
                  {isCadastroAssistantActive ? (
                    <>
                      {extractionResult ? (
                        <>
                          <Button
                            type="button"
                            size="lg"
                            variant="outline"
                            className="rounded-none"
                            disabled={isExtractPending}
                            onClick={() => void onRunCadastroAssistantExtraction()}
                          >
                            <RefreshCcw className="mr-2 size-4" />
                            Refazer
                          </Button>
                          <Button
                            type="button"
                            size="lg"
                            className="rounded-none"
                            disabled={isExtractPending}
                            onClick={onApplyExtraction}
                          >
                            Importar para o formulário
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          size="lg"
                          className="rounded-none"
                          disabled={!selectedDocument || isExtractPending}
                          onClick={() => void onRunCadastroAssistantExtraction()}
                        >
                          {isExtractPending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <ScanSearch className="mr-2 size-4" />}
                          {isExtractPending ? "Extraindo informações..." : "Extrair informações"}
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        size="lg"
                        variant="outline"
                        className="min-w-44 rounded-none"
                        disabled={!selectedDocument || isUploadPending}
                        onClick={openReplaceDialog}
                      >
                        <RefreshCcw className="mr-2 size-4" />
                        Substituir
                      </Button>
                      <Button
                        type="button"
                        size="lg"
                        variant="outline"
                        className="min-w-40 rounded-none"
                        disabled={!selectedDocument || isUploadPending || isDeletePending}
                        onClick={() => selectedDocument && onDeleteDocument(selectedDocument.localId)}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Excluir
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-hidden border-t border-slate-200 bg-white shadow-[inset_0_0_0_1px_rgba(226,232,240,0.8)]">
                {isCadastroAssistantActive ? (
                  <CadastroAssistantPanel
                    selectedDocument={selectedDocument}
                    result={extractionResult}
                    isPending={isExtractPending}
                    error={extractionError}
                    progress={extractionProgress}
                    preview={extractionPreview}
                    onRunExtraction={onRunCadastroAssistantExtraction}
                    onApplyExtraction={onApplyExtraction}
                  />
                ) : selectedDocument?.status === "READY" && previewSourceUrl ? (
                  <div className="flex h-full min-h-0 overflow-hidden bg-white">
                    <div className="min-h-0 flex-1 overflow-hidden bg-white">
                      <iframe
                        title={selectedDocument.originalName}
                        src={previewSourceUrl}
                        className="h-full w-full border-0"
                        allow="fullscreen"
                      />
                    </div>
                    {documentAssistantSidebar ?? null}
                  </div>
                ) : (
                  <div className="flex h-full min-h-0 items-center justify-center bg-slate-50/70 px-6">
                    <div className="mx-auto flex w-full max-w-2xl flex-col items-center border border-dashed border-slate-300 bg-white px-8 py-12 text-center">
                      {selectedDocument?.status === "FAILED" ? (
                        <AlertCircle className="size-8 text-destructive" />
                      ) : (
                        <LoaderCircle className="size-8 animate-spin text-primary" />
                      )}
                      <p className="mt-5 text-lg font-semibold text-primary">
                        {selectedDocument?.status === "FAILED"
                          ? "O documento não pôde ser processado"
                          : "Estamos processando este documento"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {selectedDocument?.message ?? "Chunking, embeddings e indexação vetorial em andamento."}
                      </p>
                      <div className="mt-6 h-2 w-full bg-slate-200">
                        <div
                          className="h-full bg-primary transition-[width]"
                          style={{ width: `${selectedDocument?.progressPercent ?? 0}%` }}
                        />
                      </div>
                      <p className="mt-3 text-xs font-semibold tracking-[0.16em] text-muted-foreground">
                        {Math.round(selectedDocument?.progressPercent ?? 0)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogState.open}
        onOpenChange={nextOpen => {
          setDialogState(prev => ({ ...prev, open: nextOpen }))
          if (!nextOpen) setDialogFile(null)
        }}
      >
        <DialogContent className="max-w-xl rounded-none">
          <DialogHeader>
            <DialogTitle>{dialogState.mode === "replace" ? "Substituir documento" : "Adicionar novo documento"}</DialogTitle>
            <DialogDescription>
              Defina o tipo do arquivo e envie o PDF para processamento completo no R2, chunking e embeddings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-primary">Tipo do documento</p>
              <Select value={dialogDocumentType} onValueChange={value => setDialogDocumentType(value as LicitacaoDocumentType)}>
                <SelectTrigger className="rounded-none">
                  <SelectValue placeholder="Selecione o tipo do documento" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-slate-300 px-8 py-12 text-center hover:border-primary/50 hover:bg-slate-50">
              <FileText className="size-7 text-primary" />
              <p className="mt-4 text-base font-semibold text-primary">
                {dialogFile ? dialogFile.name : "Clique para selecionar o PDF do documento"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {dialogFile ? formatBytes(dialogFile.size) : `Suporta arquivos PDF de até ${MAX_FILE_SIZE_MB}MB`}
              </p>

              <input
                type="file"
                accept=".pdf,application/pdf"
                className="sr-only"
                onChange={event => setDialogFile(event.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="ghost" className="rounded-none" onClick={() => setDialogState(prev => ({ ...prev, open: false }))}>
              Cancelar
            </Button>
            <Button type="button" className="rounded-none" disabled={!dialogFile} onClick={handleSubmitDialog}>
              {dialogState.mode === "replace" ? "Substituir documento" : "Adicionar documento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDocumentType(type: LicitacaoDocumentType) {
  if (type === "EDITAL") return "Edital"
  if (type === "ANEXO") return "Anexo"
  return "Outro"
}

function getDocumentProgressValue(document: LicitacaoDocumentItem) {
  if (document.status === "READY") return 100
  if (document.status === "FAILED") return document.progressPercent ?? 100
  return document.progressPercent ?? 0
}

function shouldShowDocumentProgress(status: LicitacaoDocumentItem["status"]) {
  return status !== "READY" && status !== "FAILED"
}

function renderDocumentStatusIcon(status: LicitacaoDocumentItem["status"]) {
  if (status === "READY") return <CheckCircle2 className="size-3.5 text-emerald-600" />
  if (status === "FAILED") return <XCircle className="size-3.5 text-rose-600" />
  return <LoaderCircle className="size-3.5 animate-spin text-sky-600" />
}
