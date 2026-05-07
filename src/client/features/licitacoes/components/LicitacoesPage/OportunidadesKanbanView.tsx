"use client"

import { useMemo, useState } from "react"
import { CalendarClock, Check, MoreHorizontal, UserRound } from "lucide-react"
import { Badge } from "@/client/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/client/components/ui/card"
import { cn } from "@/client/main/lib/utils"
import type { OportunidadeBoardItem, WorkflowNode } from "../../services/use-licitacao.service"
import { OportunidadeWorkflowActions } from "./OportunidadeWorkflowActions"

function formatDate(date: string | null) {
  if (!date) return "Sem data"

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date))
}

function formatCurrency(value: string | null) {
  if (!value) return null
  const numericValue = Number(value)
  if (Number.isNaN(numericValue)) return null

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(numericValue)
}

function formatCompactCurrency(value: string | null | undefined) {
  if (!value) return "R$ 0"
  const numericValue = Number(value)
  if (Number.isNaN(numericValue)) return "R$ 0"

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(numericValue)
}

export function OportunidadesKanbanView({
  phases,
  items,
  columnSummaries,
  isMoving,
  movingOportunidadeId,
  getMoveOptions,
  getReachableNodeForPhase,
  onMoveToNode,
  onMoveToPhase,
}: {
  phases: WorkflowNode[]
  items: OportunidadeBoardItem[]
  columnSummaries: Array<{
    phaseNodeId: string
    itemCount: number
    valorEstimadoTotal: string
  }>
  isMoving: boolean
  movingOportunidadeId: string | null
  getMoveOptions: (item: OportunidadeBoardItem) => Array<{
    nodeId: string
    label: string
    transitionType: string | null
    phaseId: string | null
    phaseLabel: string | null
  }>
  getReachableNodeForPhase: (item: OportunidadeBoardItem, phaseId: string) => {
    nodeId: string
  } | null
  onMoveToNode: (params: { oportunidadeId: string; targetNodeId: string }) => Promise<void>
  onMoveToPhase: (item: OportunidadeBoardItem, phaseId: string) => Promise<void>
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [hoveredPhaseId, setHoveredPhaseId] = useState<string | null>(null)

  const phaseToneById = useMemo(() => {
    const palette = [
      {
        accent: "text-slate-500",
        badge: "bg-blue-600 text-white",
        issue: "bg-emerald-500",
      },
      {
        accent: "text-blue-600",
        badge: "bg-emerald-700 text-white",
        issue: "bg-blue-600",
      },
      {
        accent: "text-amber-600",
        badge: "bg-violet-600 text-white",
        issue: "bg-amber-500",
      },
      {
        accent: "text-emerald-600",
        badge: "bg-slate-700 text-white",
        issue: "bg-emerald-600",
      },
    ]

    return new Map(phases.map((phase, index) => [phase.id, palette[index % palette.length]]))
  }, [phases])

  const itemsByPhase = useMemo(() => {
    const map = new Map<string, OportunidadeBoardItem[]>()
    for (const phase of phases) map.set(phase.id, [])

    for (const item of items) {
      const phaseId = item.workflow.phase?.id
      if (!phaseId) continue
      const list = map.get(phaseId) ?? []
      list.push(item)
      map.set(phaseId, list)
    }

    return map
  }, [items, phases])

  const summaryByPhaseId = useMemo(() => {
    return new Map(columnSummaries.map(summary => [summary.phaseNodeId, summary]))
  }, [columnSummaries])

  return (
    <div className="min-w-0 w-full max-w-full overflow-hidden border border-slate-200 bg-white">
      <div className="min-w-0 w-full max-w-full overflow-x-auto overflow-y-hidden">
        <div className="flex w-max min-w-full min-h-[68vh] gap-3 bg-white p-3">
        {phases.map(phase => {
          const phaseItems = itemsByPhase.get(phase.id) ?? []
          const tone = phaseToneById.get(phase.id)
          const summary = summaryByPhaseId.get(phase.id)

          return (
            <div
              key={phase.id}
              className={cn(
                "flex w-[320px] shrink-0 flex-col rounded-lg bg-[#f4f5f7] transition-colors",
                hoveredPhaseId === phase.id && "ring-2 ring-blue-200",
              )}
              onDragOver={(event) => {
                if (!draggingId) return
                event.preventDefault()
                setHoveredPhaseId(phase.id)
              }}
              onDragLeave={() => {
                if (hoveredPhaseId === phase.id) setHoveredPhaseId(null)
              }}
              onDrop={(event) => {
                event.preventDefault()
                const oportunidadeId = event.dataTransfer.getData("text/oportunidadeId")
                const item = items.find(entry => entry.oportunidadeId === oportunidadeId)
                setHoveredPhaseId(null)
                setDraggingId(null)

                if (!item) return
                if (!getReachableNodeForPhase(item, phase.id)) return

                void onMoveToPhase(item, phase.id)
              }}
            >
              <div className="px-3 py-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-[0.78rem] font-bold uppercase tracking-[0.06em] text-slate-600">
                        {phase.label}
                      </p>
                      {phase.label.toLowerCase().includes("concl") || phase.label.toLowerCase().includes("ganh") ? (
                        <Check className="size-4 shrink-0 text-emerald-600" />
                      ) : null}
                      <span className="text-[0.8rem] font-semibold text-slate-500">{phaseItems.length}</span>
                    </div>
                    <button type="button" className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700">
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>
                  <p className="truncate text-[0.75rem] font-semibold text-[#172b4d]">
                    {formatCompactCurrency(summary?.valorEstimadoTotal)}
                  </p>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2 px-2 pb-2">
                {phaseItems.length === 0 ? (
                  <div className="flex min-h-24 items-center justify-center rounded-md border border-dashed border-slate-300 bg-white/60 px-4 text-center text-sm leading-6 text-muted-foreground">
                    <span className="max-w-[250px] whitespace-normal">
                      Solte uma oportunidade aqui ou mova a partir de outro status válido.
                    </span>
                  </div>
                ) : (
                  phaseItems.map(item => {
                    const moveOptions = getMoveOptions(item)

                    return (
                      <Card
                        key={item.oportunidadeId}
                        draggable={item.canMove && !isMoving}
                        onDragStart={(event) => {
                          if (!item.canMove) return
                          event.dataTransfer.setData("text/oportunidadeId", item.oportunidadeId)
                          setDraggingId(item.oportunidadeId)
                        }}
                        onDragEnd={() => {
                          setDraggingId(null)
                          setHoveredPhaseId(null)
                        }}
                        className={cn(
                          "rounded-lg border border-slate-300/80 bg-white shadow-[0_1px_2px_rgba(9,30,66,0.18)] transition-shadow hover:shadow-[0_3px_8px_rgba(9,30,66,0.2)]",
                          draggingId === item.oportunidadeId && "opacity-60",
                        )}
                      >
                        <CardHeader className="space-y-2 px-3 pt-3 pb-1.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              {item.modalidade ? (
                                <Badge className={cn("mb-1.5 rounded px-1.5 py-0 text-[0.65rem] font-bold uppercase leading-5 shadow-none", tone?.badge ?? "bg-slate-700 text-white")}>
                                  {item.modalidade}
                                </Badge>
                              ) : null}
                              <CardTitle className="line-clamp-3 text-[0.92rem] font-medium leading-5 text-[#172b4d]">
                                {item.title}
                              </CardTitle>
                              <p className="mt-1 line-clamp-1 text-[0.74rem] leading-5 text-slate-500">
                                {item.orgaoNome ?? "Órgão não identificado"}
                              </p>
                            </div>
                            <OportunidadeWorkflowActions
                              item={item}
                              moveOptions={moveOptions}
                              isMoving={movingOportunidadeId === item.oportunidadeId}
                              compact
                              onMove={(targetNodeId) => onMoveToNode({
                                oportunidadeId: item.oportunidadeId,
                                targetNodeId,
                              })}
                            />
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {item.workflow.status ? (
                              <Badge variant="secondary" className="rounded bg-slate-100 px-1.5 py-0 text-[0.65rem] font-semibold leading-5 text-slate-700 shadow-none">
                                {item.workflow.status.label}
                              </Badge>
                            ) : null}
                            {item.workflow.situation ? (
                              <Badge variant="outline" className="rounded border-rose-100 bg-rose-50 px-1.5 py-0 text-[0.65rem] font-semibold leading-5 text-rose-700 shadow-none">
                                {item.workflow.situation.label}
                              </Badge>
                            ) : null}
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-2 px-3 pb-3">
                          <div className="flex items-end justify-between gap-3 pt-1">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className={cn("flex size-4 shrink-0 items-center justify-center rounded-[3px]", tone?.issue ?? "bg-emerald-600")}>
                                  <span className="h-2 w-1.5 rounded-[1px] bg-white" />
                                </span>
                                <span className="truncate text-[0.72rem] font-bold uppercase tracking-[0.02em] text-slate-500">
                                  {item.numero ?? item.oportunidadeId.slice(0, 8)}
                                </span>
                              </div>
                              <p className="mt-1 truncate text-[0.78rem] font-semibold text-[#172b4d]">
                                {formatCurrency(item.valorEstimado) ?? "Valor a definir"}
                              </p>
                              <div className="mt-1 flex min-w-0 items-center gap-2 text-[0.68rem] text-slate-500">
                                <span className="flex min-w-0 items-center gap-1">
                                  <UserRound className="size-3.5 shrink-0" />
                                  <span className="truncate">{item.responsavel?.name ?? "Sem responsável"}</span>
                                </span>
                                <span className="shrink-0 text-slate-300">·</span>
                                <span className="flex min-w-0 items-center gap-1">
                                  <CalendarClock className="size-3.5 shrink-0" />
                                  <span className="truncate">{formatDate(item.workflow.updatedAt ?? item.updatedAt)}</span>
                                </span>
                              </div>
                            </div>

                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}
