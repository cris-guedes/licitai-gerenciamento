"use client"

import type { ReactNode } from "react"
import { CalendarClock, Clock3, TimerReset } from "lucide-react"
import { Badge } from "@/client/components/ui/badge"
import { WorkspacePanel } from "@/client/components/workspace"
import type { OportunidadeWorkspaceModel } from "../../types/oportunidade-workspace"

type ScheduleEvent = {
  id: string
  label: string
  value: string
  detail?: string | null
}

type ScheduleTone = "past" | "today" | "urgent" | "attention" | "upcoming" | "muted"

export function OportunidadeScheduleModule({
  workspace,
}: {
  workspace: OportunidadeWorkspaceModel
}) {
  const licitacaoWorkspace = workspace.licitacaoWorkspace
  const licitacao = licitacaoWorkspace?.licitacao ?? null
  const edital = licitacaoWorkspace?.edital ?? null
  const cronograma = edital?.cronograma ?? null
  const draftPreview = licitacaoWorkspace?.oportunidade.draftPreview ?? licitacaoWorkspace?.licitacao.draftPreview ?? null

  const events = buildScheduleEvents({
    publicacao: licitacao?.dataPublicacao ?? null,
    acolhimentoInicio: cronograma?.acolhimentoInicio ?? null,
    acolhimentoFim: cronograma?.acolhimentoFim ?? null,
    esclarecimentosAte: cronograma?.esclarecimentosAte ?? null,
    impugnacaoAte: cronograma?.impugnacaoAte ?? null,
    abertura: edital?.dataAbertura ?? licitacao?.dataAberturaProposta ?? draftPreview?.dataAbertura ?? null,
    sessaoPublica: cronograma?.sessaoPublicaEm ?? null,
    encerramento: edital?.dataEncerramento ?? licitacao?.dataEncerramentoProposta ?? null,
  })

  const nextEvent = events.find(event => isFutureOrToday(event.value)) ?? null
  const latestEvent = events.at(-1) ?? null

  return (
    <div className="space-y-4">
      <WorkspacePanel
        title="Cronograma"
        description="Principais datas operacionais da licitação, em ordem cronológica."
        actions={
          <Badge variant="outline" className="rounded-full border-slate-200 bg-white text-slate-600">
            {events.length} marco{events.length === 1 ? "" : "s"}
          </Badge>
        }
      >
        {events.length ? (
          <div className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
              <HighlightCard
                icon={<CalendarClock className="size-4" />}
                title="Próximo marco"
                label={nextEvent?.label ?? "Nenhum prazo futuro"}
                value={nextEvent ? formatScheduleDate(nextEvent.value) : "Todos os prazos conhecidos já passaram"}
                helper={nextEvent ? buildRelativeLabel(nextEvent.value) : "Acompanhe novas retificações e atualizações do edital"}
                tone={nextEvent ? getEventTone(nextEvent.value) : "muted"}
              />

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <MiniInfoCard
                  icon={<Clock3 className="size-4" />}
                  label="Hora limite"
                  value={cronograma?.horaLimite ?? "Não informada"}
                  helper="Horário operacional registrado no edital"
                />
                <MiniInfoCard
                  icon={<TimerReset className="size-4" />}
                  label="Último marco"
                  value={latestEvent ? latestEvent.label : "Sem datas"}
                  helper={latestEvent ? formatScheduleDate(latestEvent.value) : "Nenhuma data consolidada"}
                />
              </div>
            </div>

            <section className="rounded-xl border border-slate-200 bg-white px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Linha do tempo
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Sequencia visual dos principais marcos da licitação.
              </p>

              <div className="mt-5">
                {events.map((event, index) => {
                  const tone = getEventTone(event.value)
                  const isLast = index === events.length - 1
                  const isCurrent = nextEvent ? nextEvent.id === event.id : latestEvent?.id === event.id

                  return (
                    <div
                      key={event.id}
                      className={`relative pl-10 ${isLast ? "" : "pb-5"}`}
                    >
                      {!isLast ? (
                        <div className="absolute left-[15px] top-5 bottom-0 w-px bg-slate-200" />
                      ) : null}

                      <div className={`absolute left-3 top-1 z-10 rounded-full ${getTimelineMarkerClassName(tone, isCurrent)}`}>
                        {isCurrent ? <div className={`absolute inset-0 rounded-full ${getTimelineMarkerGlowClassName(tone)}`} /> : null}
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold capitalize tracking-wide text-slate-400">
                              {formatMonthYear(event.value)}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className={`text-sm font-semibold ${getDateTextClassName(tone)}`}>
                                {event.label}
                              </span>
                              <Badge variant="outline" className={getBadgeClassName(tone)}>
                                {getToneLabel(tone)}
                              </Badge>
                            </div>
                            {event.detail ? (
                              <p className="mt-2 text-sm text-slate-500">
                                {event.detail}
                              </p>
                            ) : null}
                          </div>

                          <div className="shrink-0 text-left sm:text-right">
                            <p className="text-[11px] font-medium text-slate-600">
                              {formatDayAndTime(event.value)}
                            </p>
                            <p className={`mt-1 text-[10px] ${getHelperTextClassName(tone)}`}>
                              {buildRelativeLabel(event.value)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-500">
            Ainda não há datas suficientes para montar o cronograma desta licitação.
          </div>
        )}
      </WorkspacePanel>
    </div>
  )
}

function HighlightCard({
  icon,
  title,
  label,
  value,
  helper,
  tone,
}: {
  icon: ReactNode
  title: string
  label: string
  value: string
  helper: string
  tone: ScheduleTone
}) {
  return (
    <section className={`rounded-xl border px-4 py-4 ${getHighlightCardClassName(tone)}`}>
      <div className={`flex items-center gap-2 ${getHighlightHeaderClassName(tone)}`}>
        <div className={`flex size-8 items-center justify-center rounded-lg ${getHighlightIconClassName(tone)}`}>
          {icon}
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em]">{title}</p>
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-900">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tracking-tight ${getDateTextClassName(tone)}`}>{value}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={getBadgeClassName(tone)}>
          {getToneLabel(tone)}
        </Badge>
        <span className={`text-sm ${getHelperTextClassName(tone)}`}>{helper}</span>
      </div>
    </section>
  )
}

function MiniInfoCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode
  label: string
  value: string
  helper: string
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
      <div className="flex items-center gap-2 text-slate-500">
        <div className="flex size-7 items-center justify-center rounded-lg bg-white">
          {icon}
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">{label}</p>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </section>
  )
}

function buildScheduleEvents(input: {
  publicacao: string | null
  acolhimentoInicio: string | null
  acolhimentoFim: string | null
  esclarecimentosAte: string | null
  impugnacaoAte: string | null
  abertura: string | null
  sessaoPublica: string | null
  encerramento: string | null
}) {
  const rawEvents: Array<ScheduleEvent | null> = [
    createEvent("publicacao", "Publicação", input.publicacao, "Data oficial de publicação da licitação."),
    createEvent("acolhimento-inicio", "Início do acolhimento", input.acolhimentoInicio, "Janela de recebimento aberta pelo órgão."),
    createEvent("acolhimento-fim", "Fim do acolhimento", input.acolhimentoFim, "Prazo final para acolhimento de propostas."),
    createEvent("esclarecimentos", "Esclarecimentos até", input.esclarecimentosAte, "Limite para envio de pedidos de esclarecimento."),
    createEvent("impugnacao", "Impugnação até", input.impugnacaoAte, "Prazo máximo para impugnar o edital."),
    createEvent("abertura", "Abertura", input.abertura, "Marco previsto para abertura da disputa."),
    createEvent("sessao-publica", "Sessão pública", input.sessaoPublica, "Sessão pública registrada no cronograma."),
    createEvent("encerramento", "Encerramento", input.encerramento, "Término informado para a etapa principal da licitação."),
  ]

  return rawEvents
    .filter((event): event is ScheduleEvent => Boolean(event))
    .sort((a, b) => new Date(a.value).getTime() - new Date(b.value).getTime())
}

function createEvent(id: string, label: string, value: string | null, detail?: string) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return {
    id,
    label,
    value,
    detail: detail ?? null,
  } satisfies ScheduleEvent
}

function formatScheduleDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatDayAndTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatMonthYear(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
  }).format(new Date(value)).replace(".", "")
}

function buildRelativeLabel(value: string) {
  const date = new Date(value)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / 86400000)

  if (diffDays === 0) return "Hoje"
  if (diffDays === 1) return "Amanhã"
  if (diffDays === -1) return "Ontem"
  if (diffDays > 1 && diffDays <= 3) return `Faltam ${diffDays} dias`
  if (diffDays > 3 && diffDays <= 7) return `Chega em ${diffDays} dias`
  if (diffDays > 1) return `Em ${diffDays} dias`
  return `${Math.abs(diffDays)} dias atrás`
}

function isFutureOrToday(value: string) {
  const date = new Date(value)
  const now = new Date()
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  return date.getTime() >= endOfToday.getTime() || isSameCalendarDay(date, now)
}

function getEventTone(value: string): Exclude<ScheduleTone, "muted"> {
  const date = new Date(value)
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / 86400000)

  if (isSameCalendarDay(date, now)) return "today"
  if (diffDays < 0) return "past"
  if (diffDays <= 3) return "urgent"
  if (diffDays <= 7) return "attention"
  return "upcoming"
}

function isSameCalendarDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

function getToneLabel(tone: ScheduleTone) {
  if (tone === "today") return "Hoje"
  if (tone === "urgent") return "Urgente"
  if (tone === "attention") return "Em breve"
  if (tone === "upcoming") return "Próximo"
  if (tone === "past") return "Passou"
  return "Sem prazo"
}

function getBadgeClassName(tone: ScheduleTone) {
  if (tone === "today") return "rounded-full border-amber-200 bg-amber-50 text-amber-700"
  if (tone === "urgent") return "rounded-full border-rose-200 bg-rose-50 text-rose-700"
  if (tone === "attention") return "rounded-full border-orange-200 bg-orange-50 text-orange-700"
  if (tone === "upcoming") return "rounded-full border-sky-200 bg-sky-50 text-sky-700"
  if (tone === "past") return "rounded-full border-slate-200 bg-slate-100 text-slate-600"
  return "rounded-full border-slate-200 bg-white text-slate-600"
}

function getTimelineMarkerClassName(tone: Exclude<ScheduleTone, "muted">, active: boolean) {
  const sizeClass = active ? "size-3.5" : "size-2.5"

  if (tone === "today") return `${sizeClass} bg-amber-500`
  if (tone === "urgent") return `${sizeClass} bg-rose-500`
  if (tone === "attention") return `${sizeClass} bg-orange-500`
  if (tone === "upcoming") return `${sizeClass} bg-sky-500`
  return `${sizeClass} bg-slate-300`
}

function getTimelineMarkerGlowClassName(tone: Exclude<ScheduleTone, "muted">) {
  if (tone === "today") return "ring-4 ring-amber-200/70"
  if (tone === "urgent") return "ring-4 ring-rose-200/70"
  if (tone === "attention") return "ring-4 ring-orange-200/70"
  if (tone === "upcoming") return "ring-4 ring-sky-200/70"
  return "ring-4 ring-slate-200/80"
}

function getDateTextClassName(tone: ScheduleTone) {
  if (tone === "today") return "text-amber-800"
  if (tone === "urgent") return "text-rose-800"
  if (tone === "attention") return "text-orange-800"
  if (tone === "upcoming") return "text-sky-800"
  if (tone === "past") return "text-slate-800"
  return "text-primary"
}

function getHelperTextClassName(tone: ScheduleTone) {
  if (tone === "today") return "text-amber-700"
  if (tone === "urgent") return "text-rose-700"
  if (tone === "attention") return "text-orange-700"
  if (tone === "upcoming") return "text-sky-700"
  return "text-slate-500"
}

function getHighlightCardClassName(tone: ScheduleTone) {
  if (tone === "today") return "border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.95),rgba(255,247,237,0.98))]"
  if (tone === "urgent") return "border-rose-200 bg-[linear-gradient(180deg,rgba(255,241,242,0.96),rgba(255,247,237,0.96))]"
  if (tone === "attention") return "border-orange-200 bg-[linear-gradient(180deg,rgba(255,247,237,0.96),rgba(255,251,235,0.98))]"
  if (tone === "upcoming") return "border-sky-200 bg-[linear-gradient(180deg,rgba(240,249,255,0.96),rgba(239,246,255,0.98))]"
  if (tone === "past") return "border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,0.98))]"
  return "border-slate-200 bg-white"
}

function getHighlightHeaderClassName(tone: ScheduleTone) {
  if (tone === "today") return "text-amber-700"
  if (tone === "urgent") return "text-rose-700"
  if (tone === "attention") return "text-orange-700"
  if (tone === "upcoming") return "text-sky-700"
  return "text-slate-500"
}

function getHighlightIconClassName(tone: ScheduleTone) {
  if (tone === "today") return "bg-amber-100 text-amber-700"
  if (tone === "urgent") return "bg-rose-100 text-rose-700"
  if (tone === "attention") return "bg-orange-100 text-orange-700"
  if (tone === "upcoming") return "bg-sky-100 text-sky-700"
  return "bg-slate-100 text-slate-700"
}
