"use client"

import { AlertCircle, Bot, CheckCircle2, FileText, Layers3, ListChecks, Loader2, ScanSearch } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/client/components/ui/alert"
import { Badge } from "@/client/components/ui/badge"
import { Button } from "@/client/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/client/components/ui/card"
import { Progress } from "@/client/components/ui/progress"
import { cn } from "@/client/main/lib/utils"
import type { ExtractEditalDataResponse } from "@/client/main/infra/apis/api-core/models/ExtractEditalDataResponse"
import type {
  ExtractionProgressState,
  PartialExtractionPreview,
} from "../../services/use-licitacao.service"
import type { LicitacaoDocumentItem } from "../../types/licitacao-document"
import { ExtractEditalReviewWorkspace } from "./ExtractEditalReviewWorkspace"

type Props = {
  selectedDocument: LicitacaoDocumentItem | null
  result: ExtractEditalDataResponse | null
  isPending: boolean
  error: Error | null
  progress: ExtractionProgressState
  preview: PartialExtractionPreview
  onRunExtraction: () => Promise<void>
  onApplyExtraction: () => boolean
}

export function CadastroAssistantPanel({
  selectedDocument,
  result,
  isPending,
  error,
  progress,
  preview,
  onRunExtraction,
  onApplyExtraction,
}: Props) {
  const isReadyEdital = selectedDocument?.type === "EDITAL" && selectedDocument.status === "READY" && Boolean(selectedDocument.documentId)
  const licitacaoPreview = result?.licitacao ?? preview.partialResponse?.licitacao ?? null

  if (result) {
    return (
      <section className="flex h-full min-h-0 flex-col bg-white">
        <div className="min-h-0 flex-1 overflow-hidden">
          <ExtractEditalReviewWorkspace key={result.sessionId} result={result} />
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 px-6 py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="rounded-[1.75rem] border border-slate-200/80 bg-white px-6 py-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Bot className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-xl font-semibold tracking-[-0.02em] text-primary">Assistente de cadastro</h3>
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em]">
                  Estruturar edital
                </Badge>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Este assistente interpreta o edital selecionado, acompanha o pipeline de processamento e prepara uma revisão estruturada para preenchermos o cadastro com muito menos retrabalho.
              </p>
            </div>
          </div>
        </header>

        {!isReadyEdital ? (
          <Card className="rounded-[1.75rem] border-slate-200/80 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
            <CardContent className="flex min-h-[280px] flex-col items-center justify-center px-8 py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <FileText className="size-6" />
              </div>
              <p className="mt-5 text-lg font-semibold text-primary">Selecione um edital pronto para iniciar</p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Escolha um documento do tipo edital que já tenha concluído o processamento. Assim que ele estiver pronto, o assistente poderá extrair informações para o cadastro.
              </p>
              <Button type="button" className="mt-6 rounded-full px-5" disabled>
                Extrair informações do edital para cadastro
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {isReadyEdital && !isPending && !licitaoPreviewExists(licitacaoPreview) && !error ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <Card className="rounded-[1.75rem] border-slate-200/80 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Pronto para extrair este edital</CardTitle>
                <CardDescription className="text-sm leading-6">
                  O documento já está indexado. Agora podemos transformar o conteúdo dele em dados organizados para o formulário da licitação.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-[1.25rem] border border-slate-200/80 bg-slate-50/70 px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Documento selecionado</p>
                  <p className="mt-2 text-sm font-semibold text-primary">{selectedDocument?.originalName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedDocument?.type === "EDITAL" ? "Edital pronto para leitura assistida" : "Selecione um edital"}
                  </p>
                </div>

                <div className="grid gap-3">
                  <FeatureLine icon={ScanSearch} text="Lê os campos gerais e o contexto institucional do certame." />
                  <FeatureLine icon={Layers3} text="Organiza regras, cronograma, execução e habilitação." />
                  <FeatureLine icon={ListChecks} text="Consolida itens e monta uma revisão antes de aplicar ao cadastro." />
                </div>

                <Button type="button" className="h-12 rounded-full px-6 text-sm font-semibold" onClick={() => void onRunExtraction()}>
                  <ScanSearch className="mr-2 size-4" />
                  Extrair informações do edital para cadastro
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem] border-slate-200/80 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">O que você vai receber</CardTitle>
                <CardDescription className="text-sm leading-6">
                  Antes de aplicar qualquer campo, o assistente prepara uma revisão completa do que foi entendido.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <MiniStat label="Visão geral" value="Modalidade, processo, órgão e objeto" />
                <MiniStat label="Regras do certame" value="Prazos, disputa, execução e habilitação" />
                <MiniStat label="Itens" value="Tabela consolidada e métricas do pipeline" />
              </CardContent>
            </Card>
          </div>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Não foi possível concluir a extração</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : null}

        {(isPending || licitaoPreviewExists(licitacaoPreview)) && !result ? (
          <>
            <section className="grid gap-4 lg:grid-cols-2">
              <ProgressCard
                title="Campos gerais"
                description={progress.info.message}
                percent={progress.info.percent}
                completed={progress.info.completed}
              />
              <ProgressCard
                title="Itens do edital"
                description={progress.items.message}
                percent={progress.items.percent}
                completed={progress.items.completed}
              />
            </section>

            {isPending ? (
              <Alert className="border-0 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                <Loader2 className="size-4 animate-spin" />
                <AlertTitle>Extração em andamento</AlertTitle>
                <AlertDescription className="space-y-1">
                  <p>{progress.orchestrationMessage}</p>
                  {preview.totalBatches > 0 ? (
                    <p>
                      Lotes de itens concluídos: {preview.completedBatches}/{preview.totalBatches}
                    </p>
                  ) : null}
                </AlertDescription>
              </Alert>
            ) : null}

            {licitaoPreviewExists(licitacaoPreview) ? (
              <Card className="rounded-[1.75rem] border-0 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Prévia da extração</CardTitle>
                  <CardDescription className="text-sm leading-6">
                    O assistente já começou a estruturar os dados do edital. Assim que terminar, a revisão completa aparecerá aqui.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <PreviewField label="Número da licitação" value={licitacaoPreview?.numeroLicitacao} />
                    <PreviewField label="Processo" value={licitacaoPreview?.processo} />
                    <PreviewField label="Modalidade" value={licitacaoPreview?.modalidade} />
                    <PreviewField label="Situação" value={licitacaoPreview?.situacao} />
                    <PreviewField
                      label="Órgão gerenciador"
                      value={licitacaoPreview?.orgaoGerenciador?.nome}
                      className="md:col-span-2"
                    />
                    <PreviewField
                      label="Objeto"
                      value={licitacaoPreview?.objeto}
                      className="xl:col-span-4"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <PreviewStat label="Itens extraídos" value={String(preview.items.length)} />
                    <PreviewStat label="Órgãos participantes" value={String(licitacaoPreview?.edital?.orgaosParticipantes.length ?? 0)} />
                    <PreviewStat label="Documentos de habilitação" value={String(licitacaoPreview?.edital?.habilitacao.length ?? 0)} />
                    <PreviewStat label="Sessão" value={preview.sessionId} />
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  )
}

function licitaoPreviewExists(licitacaoPreview: ExtractEditalDataResponse["licitacao"] | null) {
  return Boolean(licitacaoPreview)
}

function FeatureLine({
  icon: Icon,
  text,
}: {
  icon: typeof Bot
  text: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-[1rem] border border-slate-200/80 bg-white px-4 py-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-primary">
        <Icon className="size-4" />
      </div>
      <p className="text-sm leading-6 text-slate-700">{text}</p>
    </div>
  )
}

function MiniStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-[1rem] border border-slate-200/80 bg-slate-50/70 px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-primary">{value}</p>
    </div>
  )
}

function ProgressCard({
  title,
  description,
  percent,
  completed,
}: {
  title: string
  description: string
  percent: number
  completed: boolean
}) {
  return (
    <Card className="rounded-[1.5rem] border-slate-200/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant={completed ? "default" : "secondary"}>{Math.round(percent)}%</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={percent} />
      </CardContent>
    </Card>
  )
}

function PreviewField({
  label,
  value,
  className,
}: {
  label: string
  value: string | null | undefined
  className?: string
}) {
  return (
    <div className={cn("rounded-xl bg-slate-50/70 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(196,198,205,0.18)]", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium text-primary">{value?.trim() ? value : "Não informado"}</p>
    </div>
  )
}

function PreviewStat({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="rounded-xl bg-slate-50/70 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(196,198,205,0.18)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-primary">{value?.trim() ? value : "Não informado"}</p>
    </div>
  )
}
