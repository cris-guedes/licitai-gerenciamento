"use client"

import { useMemo, useState } from "react"
import { Building2, CalendarClock, MoreHorizontal, UserRound } from "lucide-react"
import { Badge } from "@/client/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/client/components/ui/card"
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

export function OportunidadesKanbanView({
  phases,
  items,
  isMoving,
  movingOportunidadeId,
  getMoveOptions,
  getReachableNodeForPhase,
  onMoveToNode,
  onMoveToPhase,
}: {
  phases: WorkflowNode[]
  items: OportunidadeBoardItem[]
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
        dot: "bg-slate-400",
        column: "bg-[#eef3ff]",
        cardBorder: "border-l-slate-400",
        badge: "bg-slate-100 text-slate-700",
      },
      {
        dot: "bg-sky-500",
        column: "bg-[#edf5ff]",
        cardBorder: "border-l-sky-500",
        badge: "bg-sky-100 text-sky-800",
      },
      {
        dot: "bg-amber-500",
        column: "bg-[#fff5df]",
        cardBorder: "border-l-amber-400",
        badge: "bg-amber-100 text-amber-800",
      },
      {
        dot: "bg-emerald-500",
        column: "bg-[#eefbf5]",
        cardBorder: "border-l-emerald-400",
        badge: "bg-emerald-100 text-emerald-800",
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

  return (
    <div className="min-w-0 w-full max-w-full overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/70 shadow-[0_14px_34px_rgba(4,22,39,0.05)]">
      <div className="min-w-0 w-full max-w-full overflow-x-auto overflow-y-hidden">
        <div className="flex w-max min-w-full min-h-[68vh] gap-5 p-4">
        {phases.map(phase => {
          const phaseItems = itemsByPhase.get(phase.id) ?? []

          return (
            <div
              key={phase.id}
              className={[
                "flex w-[336px] shrink-0 flex-col rounded-[1.1rem] border border-slate-200/70 transition-colors",
                phaseToneById.get(phase.id)?.column ?? "bg-[#eef3ff]",
                hoveredPhaseId === phase.id ? "border-secondary/50 ring-2 ring-secondary/10" : "",
              ].join(" ")}
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
              <div className="px-4 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={["size-2 rounded-full", phaseToneById.get(phase.id)?.dot ?? "bg-slate-400"].join(" ")} />
                      <p className="text-[0.98rem] font-semibold uppercase tracking-[0.04em] text-primary">
                        {phase.label}
                      </p>
                      <Badge variant="outline" className="rounded-full border-slate-200 bg-white/80 px-2 py-0 text-[11px] text-primary">
                        {phaseItems.length}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {phaseItems.length} oportunidade{phaseItems.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <button type="button" className="rounded-full p-1 text-slate-400 transition-colors hover:bg-white/70 hover:text-slate-600">
                    <MoreHorizontal className="size-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2.5 px-3 pb-3">
                {phaseItems.length === 0 ? (
                  <div className="flex min-h-24 items-center justify-center rounded-[0.95rem] border border-dashed border-slate-300 bg-white/70 px-4 text-center text-sm leading-6 text-muted-foreground">
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
                        className={[
                          "rounded-[1rem] border border-white/90 border-l-[3px] bg-white shadow-[0_10px_22px_rgba(4,22,39,0.055)]",
                          phaseToneById.get(phase.id)?.cardBorder ?? "border-l-slate-400",
                          draggingId === item.oportunidadeId ? "opacity-60" : "",
                        ].join(" ")}
                      >
                        <CardHeader className="space-y-2 px-4 pt-3.5 pb-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              {item.modalidade ? (
                                <Badge variant="outline" className={["mb-1.5 rounded-md border-transparent px-1.5 py-0.5 text-[8px] font-semibold uppercase", phaseToneById.get(phase.id)?.badge ?? "bg-slate-100 text-slate-700"].join(" ")}>
                                  {item.modalidade}
                                </Badge>
                              ) : null}
                              <CardTitle className="line-clamp-2 text-[0.9rem] leading-snug text-primary">
                                {item.title}
                              </CardTitle>
                              <p className="mt-1 line-clamp-1 text-[0.78rem] leading-5 text-slate-600">
                                {item.orgaoNome ?? "Órgão não identificado"}
                              </p>
                            </div>
                            <button type="button" className="rounded-full p-1 text-slate-300 transition-colors hover:bg-slate-50 hover:text-slate-500">
                              <MoreHorizontal className="size-4" />
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {item.workflow.status ? (
                              <Badge variant="secondary" className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-800">
                                {item.workflow.status.label}
                              </Badge>
                            ) : null}
                            {item.workflow.situation ? (
                              <Badge variant="outline" className="rounded-full border-rose-100 bg-rose-50 px-2 py-0.5 text-[10px] text-rose-700">
                                {item.workflow.situation.label}
                              </Badge>
                            ) : null}
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-2.5 px-4 pb-3.5">
                          <div className="space-y-1.5 text-sm text-slate-700">
                            <div className="flex items-center gap-2 text-[0.72rem] text-slate-500">
                              <UserRound className="size-3.5 shrink-0" />
                              <span className="truncate">{item.responsavel?.name ?? "Sem responsável"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[0.72rem] text-slate-500">
                              <Building2 className="size-3.5 shrink-0" />
                              <span className="truncate">{item.numero ?? "Processo sem número"}</span>
                            </div>
                          </div>

                          <div className="flex items-end justify-between gap-3 border-t border-slate-100 pt-2.5">
                            <div className="min-w-0">
                              <p className="text-[0.7rem] font-medium text-slate-500">Valor estimado</p>
                              <p className="mt-0.5 text-[0.9rem] font-semibold text-[#002b8f]">
                                {formatCurrency(item.valorEstimado) ?? "A definir"}
                              </p>
                              <div className="mt-1 flex items-center gap-1.5 text-[0.68rem] text-slate-500">
                                <CalendarClock className="size-3.5 shrink-0" />
                                <span className="truncate">{formatDate(item.workflow.updatedAt ?? item.updatedAt)}</span>
                              </div>
                            </div>

                            <OportunidadeWorkflowActions
                              item={item}
                              moveOptions={moveOptions}
                              isMoving={movingOportunidadeId === item.oportunidadeId}
                              onMove={(targetNodeId) => onMoveToNode({
                                oportunidadeId: item.oportunidadeId,
                                targetNodeId,
                              })}
                            />
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
