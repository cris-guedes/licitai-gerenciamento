"use client"

import { useMemo } from "react"
import { LoaderCircle, Plus } from "lucide-react"
import { Button } from "@/client/components/ui/button"
import type { WorkflowNode, WorkflowNodeDraft, WorkflowNodeKind } from "../../types/workflow"
import {
  buildChildrenByParentId,
  buildNodeById,
  buildRootNodeIdByNodeId,
  buildKindsByParentKindId,
} from "../../utils/workflow-structure"
import { WorkflowStructureColumn } from "./WorkflowStructureColumn"
import { WorkflowNodeEditorDialog } from "./WorkflowNodeEditorDialog"

type SelectedWorkflowElement =
  | { type: "node"; id: string }
  | { type: "transition"; id: string }
  | null

type CreateWorkflowNodeFromPaletteParams = {
  kindId: string
  parentNodeId: string | null
}

export function WorkflowEditorCanvas({
  nodes,
  nodeKinds,
  selectedElement,
  isLoading,
  isSaving,
  canCreateRootNode,
  nodeDraft,
  hasNodeDraftChanges,
  selectedNodeHasChildren,
  onSelectNode,
  onClearSelection,
  onNodeDraftChange,
  onSaveNode,
  onDeleteNode,
  onCreateNodeFromPalette,
}: {
  nodes: WorkflowNode[]
  nodeKinds: WorkflowNodeKind[]
  selectedElement: SelectedWorkflowElement
  isLoading: boolean
  isSaving: boolean
  canCreateRootNode: boolean
  nodeDraft: WorkflowNodeDraft
  hasNodeDraftChanges: boolean
  selectedNodeHasChildren: boolean
  onSelectNode: (node: WorkflowNode) => void
  onClearSelection: () => void
  onNodeDraftChange: (patch: Partial<WorkflowNodeDraft>) => void
  onSaveNode: () => Promise<unknown>
  onDeleteNode: () => Promise<unknown>
  onCreateNodeFromPalette: (params: CreateWorkflowNodeFromPaletteParams) => Promise<unknown>
}) {
  const childrenByParentId = useMemo(() => buildChildrenByParentId(nodes), [nodes])
  const nodeById = useMemo(() => buildNodeById(nodes), [nodes])
  const rootNodeIdByNodeId = useMemo(() => buildRootNodeIdByNodeId(nodes), [nodes])
  const nodeKindsByParentKindId = useMemo(() => buildKindsByParentKindId(nodeKinds), [nodeKinds])
  const rootNodes = childrenByParentId.get(null) ?? []
  const rootKind = nodeKindsByParentKindId.get(null)?.[0] ?? null
  const selectedNode = selectedElement?.type === "node"
    ? nodeById.get(selectedElement.id) ?? null
    : null
  const selectedChildKind = selectedNode
    ? nodeKindsByParentKindId.get(selectedNode.kindId)?.[0] ?? null
    : null
  const selectedRootNodeId = selectedNode
    ? rootNodeIdByNodeId.get(selectedNode.id) ?? null
    : null

  const createRootNode = () => {
    if (!rootKind) return

    void onCreateNodeFromPalette({
      kindId: rootKind.id,
      parentNodeId: null,
    })
  }

  const createSelectedNodeChild = () => {
    if (!selectedNode || !selectedChildKind) return

    void onCreateNodeFromPalette({
      kindId: selectedChildKind.id,
      parentNodeId: selectedNode.id,
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_20px_50px_rgba(4,22,39,0.05)]">
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <LoaderCircle className="size-4 animate-spin" />
          Carregando estrutura do workflow...
        </div>
      </div>
    )
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-[0_18px_40px_rgba(4,22,39,0.05)]">
      <div className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            {rootNodes.length} {rootNodes.length === 1 ? "fase" : "fases"} configuradas
          </div>
          {canCreateRootNode && rootKind ? (
            <Button
              type="button"
              size="sm"
              className="rounded-xl"
              disabled={isSaving}
              onClick={createRootNode}
            >
              <Plus className="size-4" />
              Adicionar {rootKind.label.toLowerCase()}
            </Button>
          ) : null}
        </div>

        {nodeKinds.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center text-sm leading-6 text-slate-500">
            Ainda não existe uma hierarquia conceitual configurada para este workflow.
          </div>
        ) : rootNodes.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center">
            <p className="text-base font-semibold text-slate-800">Nenhuma coluna criada ainda</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Comece adicionando o primeiro nível do workflow. Depois você poderá montar os níveis internos dentro de cada coluna.
            </p>
            {canCreateRootNode && rootKind ? (
              <Button
                type="button"
                size="sm"
                className="mt-4 rounded-xl"
                disabled={isSaving}
                onClick={createRootNode}
              >
                <Plus className="size-4" />
                Adicionar {rootKind.label.toLowerCase()}
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto overflow-y-hidden pb-2">
              <div className="flex min-w-max items-start gap-4">
                {rootNodes.map(rootNode => (
                  <WorkflowStructureColumn
                    key={rootNode.id}
                    rootNode={rootNode}
                    childrenByParentId={childrenByParentId}
                    nodeKindsByParentKindId={nodeKindsByParentKindId}
                    selectedNodeId={selectedNode?.id ?? null}
                    selectedRootNodeId={selectedRootNodeId}
                    onSelectNode={onSelectNode}
                    onCreateNodeFromPalette={onCreateNodeFromPalette}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <WorkflowNodeEditorDialog
        open={Boolean(selectedNode)}
        node={selectedNode}
        nodeDraft={nodeDraft}
        isSaving={isSaving}
        hasNodeDraftChanges={hasNodeDraftChanges}
        selectedNodeHasChildren={selectedNodeHasChildren}
        childKindLabel={selectedChildKind?.label ?? null}
        onOpenChange={(open) => {
          if (!open) onClearSelection()
        }}
        onDraftChange={onNodeDraftChange}
        onSave={onSaveNode}
        onDelete={onDeleteNode}
        onAddChild={createSelectedNodeChild}
      />
    </div>
  )
}
