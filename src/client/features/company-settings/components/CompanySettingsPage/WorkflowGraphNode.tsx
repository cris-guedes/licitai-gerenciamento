"use client"

import { CircleDot, Flag, GitBranch } from "lucide-react"
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react"
import { Badge } from "@/client/components/ui/badge"
import { cn } from "@/client/main/lib/utils"
import type { WorkflowNode } from "../../types/workflow"

export type WorkflowGraphNodeData = {
  workflowNode: WorkflowNode
  color: string
  childCount: number
}

export type WorkflowGraphNodeModel = Node<WorkflowGraphNodeData, "workflow">

export function WorkflowGraphNode({ data, selected }: NodeProps<WorkflowGraphNodeModel>) {
  const node = data.workflowNode

  return (
    <div
      className={cn(
        "min-w-[220px] max-w-[260px] rounded-lg border bg-white px-3 py-2.5 shadow-[0_12px_28px_rgba(4,22,39,0.08)] transition",
        selected ? "border-secondary ring-2 ring-secondary/20" : "border-slate-200",
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="size-2.5 border-2 border-white bg-secondary"
      />
      <div className="flex items-start gap-2">
        <span className="mt-1 size-3 shrink-0 rounded-full" style={{ backgroundColor: data.color }} />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[0.82rem] font-bold leading-snug text-slate-900">{node.label}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="rounded px-1.5 py-0 text-[0.62rem] font-bold">
              {node.kind.label}
            </Badge>
            {node.isInitial ? (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[0.62rem] font-bold text-emerald-700">
                <CircleDot className="size-3" />
                Inicial
              </span>
            ) : null}
            {node.isTerminal ? (
              <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-1.5 py-0.5 text-[0.62rem] font-bold text-rose-700">
                <Flag className="size-3" />
                Final
              </span>
            ) : null}
            {data.childCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[0.62rem] font-bold text-slate-600">
                <GitBranch className="size-3" />
                {data.childCount}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="size-2.5 border-2 border-white bg-secondary"
      />
    </div>
  )
}
