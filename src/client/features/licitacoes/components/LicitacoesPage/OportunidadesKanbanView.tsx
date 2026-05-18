"use client"

import { useMemo, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { Check, MoreHorizontal } from "lucide-react"
import { cn } from "@/client/main/lib/utils"
import { OportunidadePreviewCard } from "@/client/features/oportunidades"
import type { OportunidadeBoardItem, WorkflowNode } from "../../services/use-licitacao.service"
import { OportunidadeWorkflowActions } from "./OportunidadeWorkflowActions"

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
  onMoveToNode,
  onMoveToPhase,
  onCreateComment,
  creatingCommentOportunidadeId,
  onOpenDetail,
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
  onMoveToNode: (params: { oportunidadeId: string; targetNodeId: string }) => Promise<void>
  onMoveToPhase: (item: OportunidadeBoardItem, phaseId: string) => Promise<void>
  onCreateComment: (item: OportunidadeBoardItem, content: string) => Promise<void>
  creatingCommentOportunidadeId: string | null
  onOpenDetail: (item: OportunidadeBoardItem) => void
}) {
  const params = useParams() as { orgId: string; companyId: string }
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [hoveredPhaseId, setHoveredPhaseId] = useState<string | null>(null)
  const suppressCardClickUntilRef = useRef(0)

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
        <div className="flex w-max min-w-full min-h-[68vh] gap-4 bg-white p-4">
        {phases.map(phase => {
          const phaseItems = itemsByPhase.get(phase.id) ?? []
          const tone = phaseToneById.get(phase.id)
          const summary = summaryByPhaseId.get(phase.id)

          return (
            <div
              key={phase.id}
              className={cn(
                "flex w-[352px] shrink-0 flex-col rounded-xl border border-slate-200 bg-[#f6f7f9] transition-colors",
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
                event.stopPropagation()
                suppressCardClickUntilRef.current = Date.now() + 300
                const oportunidadeId = event.dataTransfer.getData("text/oportunidadeId")
                const item = items.find(entry => entry.oportunidadeId === oportunidadeId)
                setHoveredPhaseId(null)
                setDraggingId(null)

                if (!item) return

                void onMoveToPhase(item, phase.id)
              }}
            >
              <div className="px-4 py-3.5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-[0.82rem] font-bold uppercase tracking-[0.08em] text-slate-700">
                        {phase.label}
                      </p>
                      {phase.label.toLowerCase().includes("concl") || phase.label.toLowerCase().includes("ganh") ? (
                        <Check className="size-4 shrink-0 text-emerald-600" />
                      ) : null}
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-slate-200 bg-white px-1.5 text-[11px] font-semibold text-slate-600">
                        {phaseItems.length}
                      </span>
                    </div>
                    <button type="button" className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700">
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Total estimado
                    </span>
                    <p className="truncate text-[0.82rem] font-semibold text-slate-700">
                      {formatCompactCurrency(summary?.valorEstimadoTotal)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-2.5 px-2.5 pb-2.5">
                {phaseItems.length === 0 ? (
                  <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/70 px-4 text-center text-xs leading-6 text-muted-foreground">
                    <span className="max-w-[270px] whitespace-normal">
                      Solte uma oportunidade aqui ou mova a partir de outro status válido.
                    </span>
                  </div>
                ) : (
                  phaseItems.map(item => {
                    const moveOptions = getMoveOptions(item)

                    return (
                      <div
                        key={item.oportunidadeId}
                        draggable={item.canMove && !isMoving}
                        role="button"
                        tabIndex={0}
                        onDragStart={(event) => {
                          if (!item.canMove) return
                          event.dataTransfer.setData("text/oportunidadeId", item.oportunidadeId)
                          setDraggingId(item.oportunidadeId)
                        }}
                        onDragEnd={() => {
                          suppressCardClickUntilRef.current = Date.now() + 300
                          setDraggingId(null)
                          setHoveredPhaseId(null)
                        }}
                        onClick={(event) => {
                          if (Date.now() < suppressCardClickUntilRef.current) {
                            event.preventDefault()
                            return
                          }

                          onOpenDetail(item)
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter" && event.key !== " ") return
                          event.preventDefault()
                          onOpenDetail(item)
                        }}
                        className={cn(
                          "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200",
                          draggingId === item.oportunidadeId && "opacity-60",
                        )}
                      >
                        <OportunidadePreviewCard
                          item={item}
                          href={`/org/${params.orgId}/${params.companyId}/oportunidades/${item.oportunidadeId}`}
                          onOpenDetail={() => onOpenDetail(item)}
                          onCreateComment={(content) => onCreateComment(item, content)}
                          isCreatingComment={creatingCommentOportunidadeId === item.oportunidadeId}
                          className={cn(
                            "border-slate-300/80 shadow-[0_1px_2px_rgba(9,30,66,0.18)] transition-shadow hover:shadow-[0_3px_8px_rgba(9,30,66,0.2)]",
                            tone?.accent === "text-blue-600" && "border-l-4 border-l-blue-600",
                            tone?.accent === "text-amber-600" && "border-l-4 border-l-amber-500",
                            tone?.accent === "text-emerald-600" && "border-l-4 border-l-emerald-600",
                          )}
                          action={
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
                          }
                        />
                      </div>
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
