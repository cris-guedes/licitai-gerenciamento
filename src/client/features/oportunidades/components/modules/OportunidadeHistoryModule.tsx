"use client"

import { useMemo } from "react"
import { WorkspacePanel } from "@/client/components/workspace"
import type { OportunidadeWorkspaceModel } from "../../types/oportunidade-workspace"

export function OportunidadeHistoryModule({
  workspace,
  embedded = false,
}: {
  workspace: OportunidadeWorkspaceModel
  embedded?: boolean
}) {
  const { oportunidade } = workspace
  const events = useMemo(() => {
    return [
      {
        at: oportunidade.workflow.updatedAt ?? oportunidade.updatedAt,
        title: "Última atualização",
        description: currentStateDescription(workspace),
        color: "#2B86F0",
      },
      ...(workspace.latestSyncAt ? [{
        at: workspace.latestSyncAt,
        title: "Documentos sincronizados",
        description: `${workspace.documentsSummary.total} documento${workspace.documentsSummary.total === 1 ? "" : "s"} vinculado${workspace.documentsSummary.total === 1 ? "" : "s"}`,
        color: "#16A34A",
      }] : []),
      {
        at: oportunidade.createdAt,
        title: "Oportunidade criada",
        description: "Registro iniciado no sistema",
        color: "#8A99A8",
      },
    ].sort((a, b) => new Date(b.at ?? 0).getTime() - new Date(a.at ?? 0).getTime())
  }, [oportunidade.createdAt, oportunidade.updatedAt, oportunidade.workflow.updatedAt, workspace])

  const contentNode = (
    <div role="list" aria-label="Histórico da oportunidade" className="flex flex-col">
      {events.map((event, index) => (
        <HistoryEntryRow
          key={`${event.title}-${event.at ?? index}`}
          event={event}
          isLatest={index === 0}
          isLast={index === events.length - 1}
        />
      ))}
    </div>
  )

  if (embedded) return contentNode

  return (
    <WorkspacePanel
      title="Histórico"
      description="Atualizações principais desta oportunidade."
    >
      {contentNode}
    </WorkspacePanel>
  )
}

function HistoryEntryRow({
  event,
  isLatest,
  isLast,
}: {
  event: {
    at: string | null
    title: string
    description: string
    color: string
  }
  isLatest: boolean
  isLast: boolean
}) {
  const date = formatDateLeft(event.at)

  return (
    <div role="listitem" className="grid grid-cols-[64px_20px_minmax(0,1fr)] gap-x-3">
      <div className="flex flex-col items-end pt-0.5 text-right">
        <span className="text-[11px] font-semibold leading-tight text-muted-foreground">{date.dayMonth}</span>
        <span className="text-[10px] leading-tight text-muted-foreground/50">{date.year}</span>
      </div>
      <div className="flex flex-col items-center">
        <div
          className={`z-10 mt-1 shrink-0 rounded-full ${isLatest ? "size-3" : "size-2.5"}`}
          style={{ background: event.color, ...(isLatest ? { outline: `2px solid ${event.color}`, outlineOffset: 2 } : {}) }}
          aria-hidden="true"
        />
        {!isLast ? <div className="mt-1 w-px flex-1 bg-[#E6EDF4]" /> : null}
      </div>
      <div className={`min-w-0 ${isLast ? "pb-0" : "pb-5"}`}>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold" style={{ color: event.color }}>
            {event.title}
          </span>
          {isLatest ? (
            <span className="rounded-full border px-1.5 py-0.5 text-[9px] font-semibold" style={{ color: event.color, borderColor: event.color, background: "#F8FAFC" }}>
              Última atualização
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{event.description}</p>
        {event.at ? <p className="mt-1 text-[10px] text-muted-foreground/60">{formatTime(event.at)}</p> : null}
      </div>
    </div>
  )
}

function currentStateDescription(workspace: OportunidadeWorkspaceModel) {
  const { oportunidade } = workspace
  const parts = [
    oportunidade.workflow.phase?.label,
    oportunidade.workflow.status?.label,
    oportunidade.workflow.situation?.label,
  ].filter(Boolean)

  return parts.length > 0 ? parts.join(" · ") : "Dados da oportunidade atualizados"
}

function formatDateLeft(value: string | null) {
  if (!value) return { dayMonth: "-", year: "" }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { dayMonth: "-", year: "" }

  const day = date.toLocaleDateString("pt-BR", { day: "2-digit" })
  const month = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")
  const year = date.toLocaleDateString("pt-BR", { year: "numeric" })

  return { dayMonth: `${day} ${month}`, year }
}

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}
