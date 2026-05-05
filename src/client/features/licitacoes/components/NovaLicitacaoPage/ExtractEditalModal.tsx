"use client"

import { useMemo, useState } from "react"
import {
  AlertCircle,
  Bot,
  FileText,
  Layers3,
  ListChecks,
  Loader2,
  ScanSearch,
  Upload,
  X,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/client/components/ui/alert"
import { Badge } from "@/client/components/ui/badge"
import { Button } from "@/client/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/client/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/client/components/ui/dialog"
import { Progress } from "@/client/components/ui/progress"
import { cn } from "@/client/main/lib/utils"
import type { ExtractEditalDataResponse } from "@/client/main/infra/apis/api-core/models/ExtractEditalDataResponse"
import type {
  ExtractionProgressState,
  PartialExtractionPreview,
} from "../../services/use-licitacao.service"
import { ExtractEditalReviewWorkspace } from "./ExtractEditalReviewWorkspace"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExtractFile: (file: File) => Promise<void>
  onApplyExtraction: () => void
  result: ExtractEditalDataResponse | null
  isPending: boolean
  error: Error | null
  progress: ExtractionProgressState
  preview: PartialExtractionPreview
  initialFile?: File | null
}

export function ExtractEditalModal({
  open,
  onOpenChange,
  onExtractFile,
  onApplyExtraction,
  result,
  isPending,
  error,
  progress,
  preview,
  initialFile = null,
}: Props) {
  const [pdfFile, setPdfFile] = useState<File | null>(initialFile)
  const isReviewMode = Boolean(result)

  const licitacaoPreview = useMemo(() => {
    return result?.licitacao ?? preview.partialResponse?.licitacao ?? null
  }, [preview.partialResponse?.licitacao, result?.licitacao])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!pdfFile) return
    await onExtractFile(pdfFile)
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      setPdfFile(null)
    }

    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="h-[90vh] max-w-none overflow-hidden border-0 bg-white p-0 shadow-[0_30px_80px_rgba(4,22,39,0.18)] sm:h-[88vh]"
        style={{
          width: "min(1440px, calc(100vw - 3rem))",
          maxWidth: "min(1440px, calc(100vw - 3rem))",
        }}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-b border-slate-200/80 px-8 py-6">
            <DialogHeader className="gap-1">
              <DialogTitle className="text-[1.625rem] tracking-[-0.02em] text-primary">
                Extrair campos com IA
              </DialogTitle>
              <DialogDescription className="max-w-3xl text-[15px] leading-6">
                Envie o PDF do edital para preencher automaticamente o formulário da licitação.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div
            className={cn(
              "min-h-0 flex-1",
              isReviewMode ? "overflow-hidden p-0" : "overflow-y-auto px-8 py-7",
            )}
          >
            <form
              onSubmit={handleSubmit}
              className={cn(
                "grid min-h-full",
                isReviewMode
                  ? "h-full min-h-0 grid-cols-1 gap-0"
                  : "grid-cols-1 gap-6",
              )}
            >
              <div
                className={cn(
                  isReviewMode ? "flex h-full min-h-0 flex-col" : "space-y-6",
                )}
              >
                {result ? (
                  <div className="min-h-0 flex-1">
                    <ExtractEditalReviewWorkspace
                      key={result.sessionId}
                      result={result}
                    />
                  </div>
                ) : (
                  <>
                    <section className="rounded-[1.75rem] bg-surface-container-low p-6">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-primary">Arquivo do edital</p>
                          <p className="text-sm leading-6 text-muted-foreground">
                            Faça o upload do PDF principal. A IA vai interpretar os campos estruturados do processo
                            e montar uma prévia antes de aplicar ao formulário.
                          </p>
                        </div>

                        {pdfFile ? (
                          <div className="flex min-h-32 items-center gap-4 rounded-[1.35rem] bg-white px-5 py-4 shadow-[inset_0_0_0_1px_rgba(196,198,205,0.22)]">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-primary">
                              <FileText className="size-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-primary">{pdfFile.name}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{formatBytes(pdfFile.size)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPdfFile(null)}
                              className="text-muted-foreground transition-colors hover:text-foreground"
                              disabled={isPending}
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        ) : (
                          <label
                            htmlFor="extract-edital-file"
                            className="flex min-h-32 cursor-pointer items-center gap-4 rounded-[1.35rem] bg-white px-6 py-5 text-left shadow-[inset_0_0_0_1px_rgba(196,198,205,0.22)] transition-colors hover:bg-slate-50"
                          >
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-primary">
                              <Upload className="size-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-primary">Selecionar PDF do edital</p>
                              <p className="text-sm leading-6 text-muted-foreground">
                                Aceita arquivo `.pdf` para iniciar a leitura assistida e preparar o preenchimento.
                              </p>
                            </div>
                          </label>
                        )}

                        <input
                          id="extract-edital-file"
                          type="file"
                          accept=".pdf,application/pdf"
                          className="sr-only"
                          onChange={event => setPdfFile(event.target.files?.[0] ?? null)}
                        />

                        <div className="rounded-[1.35rem] bg-white px-5 py-4 shadow-[inset_0_0_0_1px_rgba(196,198,205,0.22)]">
                          <p className="text-sm font-semibold text-primary">Saída esperada</p>
                          <div className="mt-3 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                            <FeatureLine icon={Bot} text="Leitura dos campos gerais da licitação" />
                            <FeatureLine icon={Layers3} text="Interpretação dos blocos do edital" />
                            <FeatureLine icon={ListChecks} text="Extração dos itens e validação prévia" />
                          </div>
                        </div>

                        <Button type="submit" disabled={isPending || !pdfFile} className="h-12 w-full">
                          {isPending ? (
                            <>
                              <Loader2 className="mr-2 size-4 animate-spin" />
                              Extraindo...
                            </>
                          ) : (
                            <>
                              <ScanSearch className="mr-2 size-4" />
                              Iniciar extração
                            </>
                          )}
                        </Button>
                      </div>
                    </section>

                    {isPending && (
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
                    )}

                    {isPending && (
                      <Alert className="border-0 bg-surface-container-lowest">
                        <Loader2 className="size-4 animate-spin" />
                        <AlertTitle>Extração em andamento</AlertTitle>
                        <AlertDescription className="space-y-1">
                          <p>{progress.orchestrationMessage}</p>
                          {preview.totalBatches > 0 && (
                            <p>
                              Lotes de itens concluídos: {preview.completedBatches}/{preview.totalBatches}
                            </p>
                          )}
                        </AlertDescription>
                      </Alert>
                    )}

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertTitle>Não foi possível concluir a extração</AlertTitle>
                        <AlertDescription>{error.message}</AlertDescription>
                      </Alert>
                    )}

                    {licitacaoPreview && (
                      <Card className="rounded-[1.75rem] border-0 bg-surface-container-low shadow-none">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Prévia da extração</CardTitle>
                          <CardDescription className="text-sm leading-6">
                            Os dados abaixo serão aplicados nos inputs do formulário quando você confirmar.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <PreviewField label="Número da licitação" value={licitacaoPreview.numeroLicitacao} />
                            <PreviewField label="Processo" value={licitacaoPreview.processo} />
                            <PreviewField label="Modalidade" value={licitacaoPreview.modalidade} />
                            <PreviewField label="Situação" value={licitacaoPreview.situacao} />
                            <PreviewField
                              label="Órgão gerenciador"
                              value={licitacaoPreview.orgaoGerenciador?.nome}
                              className="md:col-span-2"
                            />
                            <PreviewField
                              label="Objeto"
                              value={licitacaoPreview.objeto}
                              className="xl:col-span-4"
                            />
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <PreviewStat
                              label="Itens extraídos"
                              value={String(preview.items.length)}
                            />
                            <PreviewStat
                              label="Órgãos participantes"
                              value={String(licitacaoPreview.edital?.orgaosParticipantes.length ?? 0)}
                            />
                            <PreviewStat
                              label="Documentos de habilitação"
                              value={String(licitacaoPreview.edital?.habilitacao.length ?? 0)}
                            />
                            <PreviewStat
                              label="Sessão"
                              value={preview.sessionId}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>

              {!isReviewMode && (
                <aside className="space-y-4">
                <Card className="rounded-[1.5rem] border-0 bg-surface-container-low shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {result ? "Como revisar a extração" : "Como a IA vai ajudar"}
                    </CardTitle>
                    <CardDescription className="text-sm leading-6">
                      {result
                        ? "Use as seções laterais para validar cada bloco do edital antes de aplicar ao formulário."
                        : "Antes de aplicar qualquer dado, o sistema monta uma leitura intermediária para você revisar."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                    <FeatureBlock
                      icon={ScanSearch}
                      title={result ? "Revise os campos principais" : "Lê o contexto do certame"}
                      description={
                        result
                          ? "Comece pela visão geral para validar número, processo, modalidade, objeto e situação."
                          : "Identifica campos estáveis, bloco do edital e sinais relevantes do processo."
                      }
                    />
                    <FeatureBlock
                      icon={Layers3}
                      title={result ? "Confirme os blocos do edital" : "Organiza os blocos"}
                      description={
                        result
                          ? "Passe por órgão, regras, execução e habilitação para garantir que o contexto foi lido corretamente."
                          : "Separa informações institucionais, regras, cronograma, execução e habilitação."
                      }
                    />
                    <FeatureBlock
                      icon={ListChecks}
                      title={result ? "Valide itens e pipeline" : "Prepara a revisão"}
                      description={
                        result
                          ? "Confira a tabela de itens e, se precisar, abra a aba do pipeline para entender como a IA processou o arquivo."
                          : "Mostra prévia, métricas e itens extraídos antes de preencher o formulário."
                      }
                    />
                  </CardContent>
                </Card>
                </aside>
              )}
            </form>
          </div>

          <div className="border-t border-slate-200/80 px-8 py-5">
            <DialogFooter>
              <Button variant="outline" onClick={() => handleClose(false)}>
                Fechar
              </Button>
              <Button onClick={onApplyExtraction} disabled={!result || isPending}>
                Aplicar ao formulário
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FeatureLine({
  icon: Icon,
  text,
}: {
  icon: typeof Bot
  text: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-container-low text-primary">
        <Icon className="size-4" />
      </div>
      <p className="leading-6">{text}</p>
    </div>
  )
}

function FeatureBlock({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Bot
  title: string
  description: string
}) {
  return (
    <div className="rounded-[1.15rem] bg-white px-4 py-4 shadow-[inset_0_0_0_1px_rgba(196,198,205,0.16)]">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-primary">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">{title}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
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
    <Card className="rounded-2xl border-0 bg-surface-container-lowest shadow-none">
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
    <div className={cn("rounded-xl bg-white px-4 py-3 shadow-[inset_0_0_0_1px_rgba(196,198,205,0.18)]", className)}>
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
    <div className="rounded-xl bg-white px-4 py-3 shadow-[inset_0_0_0_1px_rgba(196,198,205,0.18)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-primary">{value?.trim() ? value : "Não informado"}</p>
    </div>
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

