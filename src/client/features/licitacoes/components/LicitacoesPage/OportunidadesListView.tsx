"use client"

import { useParams } from "next/navigation"
import { OportunidadePreviewCard } from "@/client/features/oportunidades"
import type { OportunidadeBoardItem } from "../../services/use-licitacao.service"
import { OportunidadeWorkflowActions } from "./OportunidadeWorkflowActions"

export function OportunidadesListView({
  items,
  movingOportunidadeId,
  getMoveOptions,
  onMoveToNode,
  onOpenDetail,
}: {
  items: OportunidadeBoardItem[]
  movingOportunidadeId: string | null
  getMoveOptions: (item: OportunidadeBoardItem) => Array<{
    nodeId: string
    label: string
    transitionType: string | null
    phaseId: string | null
    phaseLabel: string | null
  }>
  onMoveToNode: (params: { oportunidadeId: string; targetNodeId: string }) => Promise<void>
  onOpenDetail: (item: OportunidadeBoardItem) => void
}) {
  const params = useParams() as { orgId: string; companyId: string }

  return (
    <div className="space-y-3">
      {items.map(item => {
        return (
          <div
            key={item.oportunidadeId}
            role="button"
            tabIndex={0}
            onClick={() => onOpenDetail(item)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return
              event.preventDefault()
              onOpenDetail(item)
            }}
            className="cursor-pointer"
          >
            <OportunidadePreviewCard
              item={item}
              href={`/org/${params.orgId}/${params.companyId}/oportunidades/${item.oportunidadeId}`}
              onOpenDetail={() => onOpenDetail(item)}
              className="rounded-[1.15rem] border border-slate-200/80 shadow-[0_14px_34px_rgba(4,22,39,0.05)]"
              action={
                <OportunidadeWorkflowActions
                  item={item}
                  moveOptions={getMoveOptions(item)}
                  isMoving={movingOportunidadeId === item.oportunidadeId}
                  onMove={(targetNodeId) => onMoveToNode({
                    oportunidadeId: item.oportunidadeId,
                    targetNodeId,
                  })}
                />
              }
            />
          </div>
        )
      })}
    </div>
  )
}
