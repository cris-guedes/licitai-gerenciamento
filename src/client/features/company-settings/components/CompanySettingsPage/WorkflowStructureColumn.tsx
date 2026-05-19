"use client"

import { useState } from "react"
import { ChevronRight, Plus } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/client/components/ui/collapsible"
import { cn } from "@/client/main/lib/utils"
import type { WorkflowNode, WorkflowNodeKind } from "../../types/workflow"

type CreateWorkflowNodeFromPaletteParams = {
  kindId: string
  parentNodeId: string | null
}

function getNodeColor(node: WorkflowNode) {
  return node.color ?? node.kind.color ?? "#3b82f6"
}

function pluralizeKindLabel(label: string, count: number) {
  const normalized = label.toLowerCase()
  if (count === 1) return normalized
  if (normalized.endsWith("ão")) return `${normalized.slice(0, -2)}ões`
  if (normalized.endsWith("s")) return normalized
  return `${normalized}s`
}

function buildChildSummary({
  childrenCount,
  childKind,
}: {
  childrenCount: number
  childKind: WorkflowNodeKind | null
}) {
  if (!childKind) return "Sem filhos"
  return `${childrenCount} ${pluralizeKindLabel(childKind.label, childrenCount)}`
}

function WorkflowKanbanItem({
  node,
  level = 0,
  selectedNodeId,
  childrenByParentId,
  nodeKindsByParentKindId,
  onSelectNode,
}: {
  node: WorkflowNode
  level?: number
  selectedNodeId: string | null
  childrenByParentId: Map<string | null, WorkflowNode[]>
  nodeKindsByParentKindId: Map<string | null, WorkflowNodeKind[]>
  onSelectNode: (node: WorkflowNode) => void
}) {
  const [open, setOpen] = useState(false)
  const children = childrenByParentId.get(node.id) ?? []
  const childKind = nodeKindsByParentKindId.get(node.kindId)?.[0] ?? null
  const isSelected = selectedNodeId === node.id
  const isExpandable = children.length > 0
  const childSummary = buildChildSummary({
    childrenCount: children.length,
    childKind,
  })

  return (
    <div className={cn(level > 0 && "ml-4 border-l border-slate-200 pl-3")}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div
          className={cn(
            "rounded-lg border bg-white px-3 py-3 transition",
            level === 0 ? "border-slate-200 shadow-[0_4px_14px_rgba(4,22,39,0.04)]" : "border-slate-200/80",
            isSelected && "border-sky-300 bg-sky-50",
          )}
        >
          <div className="flex items-start gap-2">
            <CollapsibleTrigger asChild disabled={!isExpandable}>
              <button
                type="button"
                className={cn(
                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-slate-500 transition",
                  isExpandable ? "hover:bg-slate-100" : "cursor-default opacity-35",
                )}
                aria-label={open ? "Recolher" : "Expandir"}
              >
                <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} />
              </button>
            </CollapsibleTrigger>

            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => onSelectNode(node)}
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: getNodeColor(node) }}
                />
                <span className="truncate text-sm font-medium text-slate-900">{node.label}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{node.kind.label}</span>
                <span className="text-slate-300">•</span>
                <span>{childSummary}</span>
              </div>
            </button>
          </div>
        </div>

        {isExpandable ? (
          <CollapsibleContent className="pt-2">
            <div className="space-y-2">
              {children.map(child => (
                <WorkflowKanbanItem
                  key={child.id}
                  node={child}
                  level={level + 1}
                  selectedNodeId={selectedNodeId}
                  childrenByParentId={childrenByParentId}
                  nodeKindsByParentKindId={nodeKindsByParentKindId}
                  onSelectNode={onSelectNode}
                />
              ))}
            </div>
          </CollapsibleContent>
        ) : null}
      </Collapsible>
    </div>
  )
}

export function WorkflowStructureColumn({
  rootNode,
  childrenByParentId,
  nodeKindsByParentKindId,
  selectedNodeId,
  selectedRootNodeId,
  onSelectNode,
  onCreateNodeFromPalette,
}: {
  rootNode: WorkflowNode
  childrenByParentId: Map<string | null, WorkflowNode[]>
  nodeKindsByParentKindId: Map<string | null, WorkflowNodeKind[]>
  selectedNodeId: string | null
  selectedRootNodeId: string | null
  onSelectNode: (node: WorkflowNode) => void
  onCreateNodeFromPalette: (params: CreateWorkflowNodeFromPaletteParams) => Promise<unknown>
}) {
  const childNodes = childrenByParentId.get(rootNode.id) ?? []
  const childKind = nodeKindsByParentKindId.get(rootNode.kindId)?.[0] ?? null
  const isActiveColumn = selectedRootNodeId === rootNode.id
  const childSummary = buildChildSummary({
    childrenCount: childNodes.length,
    childKind,
  })

  const createChild = () => {
    if (!childKind) return

    void onCreateNodeFromPalette({
      kindId: childKind.id,
      parentNodeId: rootNode.id,
    })
  }

  return (
    <section
      className={cn(
        "flex min-h-[540px] w-[320px] min-w-[320px] flex-col rounded-xl border bg-slate-50/70",
        isActiveColumn ? "border-sky-300 shadow-[0_10px_26px_rgba(59,130,246,0.08)]" : "border-slate-200",
      )}
    >
      <div className="border-b border-slate-200 px-4 py-4">
        <button
          type="button"
          className="w-full text-left"
          onClick={() => onSelectNode(rootNode)}
        >
          <div className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: getNodeColor(rootNode) }}
            />
            <h3 className="truncate text-base font-semibold text-slate-950">{rootNode.label}</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">{childSummary}</p>
        </button>

        {childKind ? (
          <Button
            type="button"
            variant="outline"
            
            className="mt-3 rounded-lg"
            onClick={createChild}
          >
            <Plus className="size-3.5" />
            Adicionar {childKind.label.toLowerCase()}
          </Button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {childNodes.length > 0 ? (
          <div className="space-y-3">
            {childNodes.map(node => (
              <WorkflowKanbanItem
                key={node.id}
                node={node}
                selectedNodeId={selectedNodeId}
                childrenByParentId={childrenByParentId}
                nodeKindsByParentKindId={nodeKindsByParentKindId}
                onSelectNode={onSelectNode}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
            {childKind
              ? `Nenhum ${childKind.label.toLowerCase()} cadastrado.`
              : "Esta fase não possui níveis internos."}
          </div>
        )}
      </div>
    </section>
  )
}

