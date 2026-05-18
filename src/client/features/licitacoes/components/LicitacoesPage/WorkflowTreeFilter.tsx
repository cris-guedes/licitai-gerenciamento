"use client"

import { useMemo, useState } from "react"
import { Check, ChevronDown, ChevronRight, GitBranch, Minus, Search, X } from "lucide-react"
import { Badge } from "@/client/components/ui/badge"
import { Button } from "@/client/components/ui/button"
import { Input } from "@/client/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/client/components/ui/popover"
import { ScrollArea } from "@/client/components/ui/scroll-area"
import { cn } from "@/client/main/lib/utils"
import type { WorkflowNode } from "../../services/use-licitacao.service"

type WorkflowTreeNode = WorkflowNode & {
  children: WorkflowTreeNode[]
}

type CheckState = boolean | "indeterminate"

export function WorkflowTreeFilter({
  nodes,
  selectedNodeIds,
  onSelectedNodeIdsChange,
}: {
  nodes: WorkflowNode[]
  selectedNodeIds: string[]
  onSelectedNodeIdsChange: (nodeIds: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([])
  const tree = useMemo(() => buildWorkflowTree(nodes), [nodes])
  const visibleTree = useMemo(() => filterTree(tree, search), [tree, search])
  const selectedNodeSet = useMemo(() => new Set(selectedNodeIds), [selectedNodeIds])
  const expandedNodeSet = useMemo(() => new Set(expandedNodeIds), [expandedNodeIds])
  const summaryNodes = useMemo(() => collectSummaryNodes(tree, selectedNodeSet), [tree, selectedNodeSet])

  const triggerLabel = getTriggerLabel(summaryNodes)

  const handleToggleNode = (node: WorkflowTreeNode) => {
    const subtreeNodeIds = getSubtreeNodeIds(node)
    const nextSelectedNodeIds = new Set(selectedNodeIds)
    const state = getCheckState(node, selectedNodeSet)

    if (state === true) {
      for (const nodeId of subtreeNodeIds) nextSelectedNodeIds.delete(nodeId)
    } else {
      for (const nodeId of subtreeNodeIds) nextSelectedNodeIds.add(nodeId)
    }

    onSelectedNodeIdsChange(normalizeSelectedNodeIds(tree, nextSelectedNodeIds))
  }

  const handleToggleExpanded = (nodeId: string) => {
    setExpandedNodeIds(previous => {
      if (previous.includes(nodeId)) return previous.filter(id => id !== nodeId)
      return [...previous, nodeId]
    })
  }

  const handleClear = () => {
    setSearch("")
    onSelectedNodeIdsChange([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-start rounded-lg border-slate-200 bg-white px-3 text-left font-normal shadow-none",
            selectedNodeIds.length === 0 && "text-muted-foreground",
          )}
        >
          <GitBranch className="mr-2 size-4 shrink-0 text-slate-500" />
          <span className="min-w-0 flex-1 truncate">{triggerLabel}</span>
          {summaryNodes.length > 0 ? (
            <Badge variant="secondary" className="ml-2 h-5 rounded px-1.5 text-[0.65rem]">
              {summaryNodes.length}
            </Badge>
          ) : null}
          <ChevronDown className="ml-2 size-4 shrink-0 text-slate-400" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[360px] max-w-[calc(100vw-2rem)] p-0 sm:w-[420px]">
        <div className="border-b border-slate-100 p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Buscar no fluxo..."
              className="h-9 rounded-lg border-slate-200 pl-9 shadow-none"
            />
          </div>
        </div>

        <ScrollArea className="h-72">
          <div className="p-2">
            {visibleTree.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                Nenhum nó encontrado.
              </div>
            ) : (
              visibleTree.map(node => (
                <WorkflowTreeFilterRow
                  key={node.id}
                  node={node}
                  selectedNodeSet={selectedNodeSet}
                  expandedNodeSet={expandedNodeSet}
                  forceExpanded={Boolean(search.trim())}
                  onToggle={handleToggleNode}
                  onToggleExpanded={handleToggleExpanded}
                />
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between border-t border-slate-100 p-2">
          <span className="px-2 text-xs font-medium text-slate-500">
            {summaryNodes.length === 0 ? "Todo o fluxo" : `${summaryNodes.length} selecionado${summaryNodes.length === 1 ? "" : "s"}`}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg px-2 text-slate-600"
            onClick={handleClear}
            disabled={selectedNodeIds.length === 0 && !search}
          >
            <X className="mr-1.5 size-3.5" />
            Limpar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function WorkflowTreeFilterRow({
  node,
  selectedNodeSet,
  expandedNodeSet,
  forceExpanded,
  onToggle,
  onToggleExpanded,
}: {
  node: WorkflowTreeNode
  selectedNodeSet: Set<string>
  expandedNodeSet: Set<string>
  forceExpanded: boolean
  onToggle: (node: WorkflowTreeNode) => void
  onToggleExpanded: (nodeId: string) => void
}) {
  const state = getCheckState(node, selectedNodeSet)
  const hasChildren = node.children.length > 0
  const isExpanded = forceExpanded || expandedNodeSet.has(node.id)

  return (
    <div>
      <button
        type="button"
        className="flex h-9 w-full items-center gap-1.5 rounded-md pr-2 text-left text-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
        style={{ paddingLeft: 8 + node.depth * 16 }}
        onClick={() => onToggle(node)}
      >
        <span
          role="button"
          tabIndex={hasChildren ? 0 : -1}
          aria-label={isExpanded ? "Recolher" : "Expandir"}
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded text-slate-400 transition-colors",
            hasChildren && "hover:bg-slate-100 hover:text-slate-700",
            !hasChildren && "invisible",
          )}
          onClick={(event) => {
            event.stopPropagation()
            if (hasChildren) onToggleExpanded(node.id)
          }}
          onKeyDown={(event) => {
            if (!hasChildren) return
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              event.stopPropagation()
              onToggleExpanded(node.id)
            }
          }}
        >
          {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </span>
        <WorkflowTreeCheck state={state} />
        <span className="min-w-0 flex-1 truncate font-medium text-slate-700">{node.label}</span>
        <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.04em] text-slate-500">
          {node.kind.label}
        </span>
      </button>

      {isExpanded
        ? node.children.map(child => (
          <WorkflowTreeFilterRow
            key={child.id}
            node={child}
            selectedNodeSet={selectedNodeSet}
            expandedNodeSet={expandedNodeSet}
            forceExpanded={forceExpanded}
            onToggle={onToggle}
            onToggleExpanded={onToggleExpanded}
          />
        ))
        : null}
    </div>
  )
}

function WorkflowTreeCheck({ state }: { state: CheckState }) {
  return (
    <span
      role="checkbox"
      aria-checked={state === "indeterminate" ? "mixed" : state}
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-[4px] border shadow-xs transition-colors",
        state === true && "border-primary bg-primary text-primary-foreground",
        state === "indeterminate" && "border-primary bg-primary text-primary-foreground",
        state === false && "border-slate-300 bg-white text-transparent",
      )}
    >
      {state === "indeterminate" ? <Minus className="size-3" /> : null}
      {state === true ? <Check className="size-3" /> : null}
    </span>
  )
}

function buildWorkflowTree(nodes: WorkflowNode[]): WorkflowTreeNode[] {
  const nodeById = new Map<string, WorkflowTreeNode>()
  const roots: WorkflowTreeNode[] = []

  for (const node of nodes) {
    nodeById.set(node.id, { ...node, children: [] })
  }

  for (const node of [...nodes].sort(sortWorkflowNodes)) {
    const treeNode = nodeById.get(node.id)
    if (!treeNode) continue

    if (node.parentId) {
      const parent = nodeById.get(node.parentId)
      if (parent) {
        parent.children.push(treeNode)
        continue
      }
    }

    roots.push(treeNode)
  }

  sortTree(roots)
  return roots
}

function sortTree(nodes: WorkflowTreeNode[]) {
  nodes.sort(sortWorkflowNodes)
  for (const node of nodes) sortTree(node.children)
}

function sortWorkflowNodes(a: WorkflowNode, b: WorkflowNode) {
  if (a.order !== b.order) return a.order - b.order
  if (a.createdAt !== b.createdAt) return a.createdAt.localeCompare(b.createdAt)
  return a.id.localeCompare(b.id)
}

function filterTree(nodes: WorkflowTreeNode[], search: string): WorkflowTreeNode[] {
  const query = normalizeText(search)
  if (!query) return nodes

  return nodes
    .map(node => {
      const children = filterTree(node.children, search)
      if (matchesNode(node, query) || children.length > 0) {
        return { ...node, children }
      }

      return null
    })
    .filter((node): node is WorkflowTreeNode => Boolean(node))
}

function matchesNode(node: WorkflowTreeNode, query: string) {
  return normalizeText(`${node.label} ${node.key} ${node.kind.label} ${node.kind.key}`).includes(query)
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim()
}

function getSubtreeNodeIds(node: WorkflowTreeNode): string[] {
  return [node.id, ...node.children.flatMap(getSubtreeNodeIds)]
}

function getCheckState(node: WorkflowTreeNode, selectedNodeSet: Set<string>): CheckState {
  const subtreeNodeIds = getSubtreeNodeIds(node)
  const selectedCount = subtreeNodeIds.filter(nodeId => selectedNodeSet.has(nodeId)).length

  if (selectedCount === 0) return false
  if (selectedCount === subtreeNodeIds.length) return true
  return "indeterminate"
}

function normalizeSelectedNodeIds(tree: WorkflowTreeNode[], rawSelectedNodeIds: Set<string>) {
  const selectedNodeIds = new Set(rawSelectedNodeIds)

  function visit(node: WorkflowTreeNode): boolean {
    if (node.children.length === 0) return selectedNodeIds.has(node.id)

    const childrenFullySelected = node.children.map(visit)
    const isFullySelected = childrenFullySelected.every(Boolean)

    if (isFullySelected) {
      selectedNodeIds.add(node.id)
      return true
    }

    selectedNodeIds.delete(node.id)
    return false
  }

  for (const node of tree) visit(node)
  return Array.from(selectedNodeIds).sort((a, b) => a.localeCompare(b))
}

function collectSummaryNodes(nodes: WorkflowTreeNode[], selectedNodeSet: Set<string>) {
  const selectedNodes: WorkflowTreeNode[] = []

  function visit(node: WorkflowTreeNode) {
    const state = getCheckState(node, selectedNodeSet)
    if (state === true) {
      selectedNodes.push(node)
      return
    }

    if (state === "indeterminate") {
      for (const child of node.children) visit(child)
    }
  }

  for (const node of nodes) visit(node)
  return selectedNodes
}

function getTriggerLabel(summaryNodes: WorkflowTreeNode[]) {
  if (summaryNodes.length === 0) return "Todo o fluxo"
  if (summaryNodes.length === 1) return summaryNodes[0].label
  if (summaryNodes.length === 2) return `${summaryNodes[0].label}, ${summaryNodes[1].label}`
  return `${summaryNodes.length} grupos selecionados`
}
