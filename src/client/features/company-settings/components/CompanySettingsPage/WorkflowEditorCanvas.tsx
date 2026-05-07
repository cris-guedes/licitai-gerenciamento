"use client"

import { useCallback, useEffect, useMemo } from "react"
import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  type Connection,
  type Edge,
  type NodeTypes,
  useEdgesState,
  useNodesState,
} from "@xyflow/react"
import { GitBranch, LoaderCircle, Plus } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import type { WorkflowNode, WorkflowNodePosition, WorkflowTransition } from "../../types/workflow"
import { WorkflowGraphNode, type WorkflowGraphNodeModel } from "./WorkflowGraphNode"

type SelectedWorkflowElement =
  | { type: "node"; id: string }
  | { type: "transition"; id: string }
  | null

const nodeTypes: NodeTypes = {
  workflow: WorkflowGraphNode,
}

function sortNodes(a: WorkflowNode, b: WorkflowNode) {
  if (a.depth !== b.depth) return a.depth - b.depth
  if (a.order !== b.order) return a.order - b.order
  if (a.createdAt !== b.createdAt) return a.createdAt.localeCompare(b.createdAt)
  return a.id.localeCompare(b.id)
}

function readObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function readPosition(node: WorkflowNode, index: number): WorkflowNodePosition {
  const metadata = readObject(node.metadata)
  const reactFlow = readObject(metadata.reactFlow)
  const position = readObject(reactFlow.position)
  const x = typeof position.x === "number" ? position.x : 80 + (node.depth * 320)
  const y = typeof position.y === "number" ? position.y : 80 + (index * 94)

  return { x, y }
}

function buildChildCountByNodeId(nodes: WorkflowNode[]) {
  const map = new Map<string, number>()

  for (const node of nodes) {
    if (!node.parentId) continue
    map.set(node.parentId, (map.get(node.parentId) ?? 0) + 1)
  }

  return map
}

function toFlowNodes(nodes: WorkflowNode[], selectedElement: SelectedWorkflowElement): WorkflowGraphNodeModel[] {
  const childCountByNodeId = buildChildCountByNodeId(nodes)

  return [...nodes].sort(sortNodes).map((node, index) => ({
    id: node.id,
    type: "workflow",
    position: readPosition(node, index),
    selected: selectedElement?.type === "node" && selectedElement.id === node.id,
    data: {
      workflowNode: node,
      color: node.color ?? node.kind.color ?? "#3b82f6",
      childCount: childCountByNodeId.get(node.id) ?? 0,
    },
  }))
}

function toFlowEdges(nodes: WorkflowNode[], transitions: WorkflowTransition[], selectedElement: SelectedWorkflowElement): Edge[] {
  const hierarchyEdges: Edge[] = nodes
    .filter(node => node.parentId)
    .map(node => ({
      id: `hierarchy:${node.parentId}:${node.id}`,
      source: node.parentId!,
      target: node.id,
      type: "smoothstep",
      selectable: false,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 14,
        height: 14,
      },
      style: {
        strokeWidth: 1.2,
        stroke: "#cbd5e1",
        strokeDasharray: "5 5",
      },
    }))

  const transitionEdges: Edge[] = transitions.map(transition => ({
    id: transition.id,
    source: transition.fromNodeId,
    target: transition.toNodeId,
    label: transition.transitionType ?? undefined,
    selected: selectedElement?.type === "transition" && selectedElement.id === transition.id,
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
    },
    style: {
      strokeWidth: selectedElement?.type === "transition" && selectedElement.id === transition.id ? 2.5 : 1.8,
      stroke: selectedElement?.type === "transition" && selectedElement.id === transition.id ? "#0058be" : "#7c8aa5",
    },
    labelStyle: {
      fill: "#334155",
      fontSize: 11,
      fontWeight: 700,
    },
    labelBgStyle: {
      fill: "#ffffff",
      fillOpacity: 0.86,
    },
  }))

  return [...hierarchyEdges, ...transitionEdges]
}

export function WorkflowEditorCanvas({
  nodes,
  transitions,
  selectedElement,
  isLoading,
  canCreateRootNode,
  onSelectNode,
  onSelectTransition,
  onCreateRootNode,
  onCreateTransition,
  onPersistNodePosition,
}: {
  nodes: WorkflowNode[]
  transitions: WorkflowTransition[]
  selectedElement: SelectedWorkflowElement
  isLoading: boolean
  canCreateRootNode: boolean
  onSelectNode: (node: WorkflowNode) => void
  onSelectTransition: (transition: WorkflowTransition) => void
  onCreateRootNode: () => void
  onCreateTransition: (fromNodeId: string, toNodeId: string) => Promise<unknown>
  onPersistNodePosition: (nodeId: string, position: WorkflowNodePosition) => void
}) {
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState<WorkflowGraphNodeModel>([])
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    setFlowNodes(toFlowNodes(nodes, selectedElement))
  }, [nodes, selectedElement, setFlowNodes])

  useEffect(() => {
    setFlowEdges(toFlowEdges(nodes, transitions, selectedElement))
  }, [nodes, selectedElement, setFlowEdges, transitions])

  const transitionById = useMemo(() => {
    const map = new Map<string, WorkflowTransition>()
    for (const transition of transitions) map.set(transition.id, transition)
    return map
  }, [transitions])

  const onConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return
    void onCreateTransition(connection.source, connection.target)
  }, [onCreateTransition])

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(4,22,39,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <GitBranch className="size-4" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-primary">Workflow do Board</h2>
            <p className="truncate text-xs text-muted-foreground">{nodes.length} etapas · {transitions.length} transições</p>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-lg"
          disabled={!canCreateRootNode || isLoading}
          onClick={onCreateRootNode}
        >
          <Plus className="size-4" />
          Nova fase
        </Button>
      </div>

      <div className="h-[660px] min-w-0 bg-slate-50">
        {isLoading ? (
          <div className="flex h-full items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Carregando workflow...
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
            Nenhum workflow encontrado para esta empresa.
          </div>
        ) : (
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => onSelectNode(node.data.workflowNode)}
            onEdgeClick={(_, edge) => {
              const transition = transitionById.get(edge.id)
              if (transition) onSelectTransition(transition)
            }}
            onNodeDragStop={(_, node) => onPersistNodePosition(node.id, node.position)}
            fitView
            minZoom={0.25}
            maxZoom={1.4}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#d7deeb" gap={20} />
            <Controls position="bottom-left" />
            <MiniMap
              pannable
              zoomable
              nodeColor={node => typeof node.data.color === "string" ? node.data.color : "#3b82f6"}
              nodeStrokeWidth={2}
              className="!rounded-lg !border !border-slate-200 !bg-white/90"
            />
          </ReactFlow>
        )}
      </div>
    </div>
  )
}
