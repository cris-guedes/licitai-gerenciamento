"use client"

import { useEffect } from "react"
import { FileText, Loader2, ShieldAlert, Sparkles, TimerReset } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/client/components/ui/alert"
import { Button } from "@/client/components/ui/button"
import type { useDocumentSummaryService } from "@/client/features/licitacoes/services/use-document-summary.service"
import { useDocumentSummaryPanel } from "../hooks/useDocumentSummaryPanel"
import type { DocumentWorkspaceProcessingState } from "../types/document-workspace"
import { DocumentSummaryCard } from "./DocumentSummaryCard"

type DocumentSummaryService = ReturnType<typeof useDocumentSummaryService>

type Props = {
  active: boolean
  documentId: string | null
  documentSummaryService: DocumentSummaryService
  processingState?: DocumentWorkspaceProcessingState
  onProcessDocument?: (() => Promise<void>) | (() => void)
}

export function DocumentSummaryPanel({
  active,
  documentId,
  documentSummaryService,
  processingState = "READY",
  onProcessDocument,
}: Props) {
  const tools = useDocumentSummaryPanel({
    documentId,
    documentSummaryService,
  })
  const { handleLoadSummary } = tools

  useEffect(() => {
    if (!active || !documentId || processingState !== "READY") return
    void handleLoadSummary()
  }, [active, documentId, handleLoadSummary, processingState])

  if (processingState !== "READY") {
    return (
      <DocumentProcessingPlaceholder
        state={processingState}
        onProcessDocument={onProcessDocument}
      />
    )
  }

  return (
    <section className="min-w-0">
      {tools.summaryError ? (
        <Alert variant="destructive">
          <AlertTitle>Nao foi possivel gerar o resumo</AlertTitle>
          <AlertDescription>{tools.summaryError.message}</AlertDescription>
        </Alert>
      ) : null}

      {tools.isLoadingSummary ? (
        <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 size-4 animate-spin" />
          Gerando resumo do documento...
        </div>
      ) : null}

      {!tools.isLoadingSummary && tools.summary ? (
        <DocumentSummaryCard summary={tools.summary} />
      ) : null}

      {!tools.isLoadingSummary && !tools.summary && tools.hasLoadedSummary && !tools.summaryError ? (
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="w-full max-w-sm rounded-[1.5rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,1))] p-6 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(37,99,235,0.08)]">
              <Sparkles className="size-6" />
            </div>

            <p className="mt-5 text-lg font-semibold tracking-[-0.02em] text-primary">
              Gere um resumo executivo
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Monte uma leitura rapida do documento com os pontos mais importantes para revisao antes do cadastro.
            </p>

            <div className="mt-6 grid gap-2 text-left">
              <SummaryFeature icon={FileText} label="Principais pontos e contexto do edital" />
              <SummaryFeature icon={TimerReset} label="Prazos e datas criticas em destaque" />
              <SummaryFeature icon={ShieldAlert} label="Requisitos e pontos de atencao" />
            </div>

            <Button
              type="button"
              className="mt-6 h-11 w-full rounded-full text-sm font-semibold shadow-[0_14px_30px_rgba(37,99,235,0.22)]"
              disabled={!documentId}
              onClick={() => void tools.handleGenerateSummary()}
            >
              <Sparkles className="mr-2 size-4" />
              Gerar resumo agora
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function SummaryFeature({
  icon: Icon,
  label,
}: {
  icon: typeof Sparkles
  label: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-[1rem] border border-slate-200/70 bg-white/80 px-3 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-primary">
        <Icon className="size-4" />
      </div>
      <p className="text-sm leading-5 text-slate-700">{label}</p>
    </div>
  )
}

function DocumentProcessingPlaceholder({
  state,
  onProcessDocument,
}: {
  state: DocumentWorkspaceProcessingState
  onProcessDocument?: (() => Promise<void>) | (() => void)
}) {
  const isFailed = state === "FAILED"
  const isProcessing = state === "PROCESSING"

  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <div className="w-full max-w-sm rounded-[1.5rem] border border-slate-200/80 bg-white p-6 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-slate-100 text-primary">
          {isProcessing ? <Loader2 className="size-6 animate-spin" /> : <Sparkles className="size-6" />}
        </div>
        <p className="mt-5 text-lg font-semibold text-primary">
          {isFailed ? "Falha no processamento" : isProcessing ? "Documento em processamento" : "Ative a IA deste documento"}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {isFailed
            ? "Tente processar novamente para liberar resumo e conversa assistida."
            : isProcessing
              ? "Assim que o documento estiver pronto, o resumo podera ser gerado aqui."
              : "Processe o documento para habilitar resumo e conversa com IA."}
        </p>
        {!isProcessing && onProcessDocument ? (
          <Button type="button" className="mt-6 rounded-full" onClick={() => void onProcessDocument()}>
            <Sparkles className="mr-2 size-4" />
            {isFailed ? "Processar novamente" : "Processar documento"}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
