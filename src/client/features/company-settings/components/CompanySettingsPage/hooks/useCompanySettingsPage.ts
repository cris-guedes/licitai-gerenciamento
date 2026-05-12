"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useCompanyWorkflowEditorService } from "../../../services/use-company-workflow-editor.service"
import type { CompanyWorkflowResponse, WorkflowNode, WorkflowNodeDraft, WorkflowNodeKind, WorkflowNodePosition, WorkflowTransition } from "../../../types/workflow"

type WorkflowEditorService = ReturnType<typeof useCompanyWorkflowEditorService>

type SelectedWorkflowElement =
  | { type: "node"; id: string }
  | { type: "transition"; id: string }
  | null

type CreateNodeFromPaletteParams = {
  kindId: string
  parentNodeId: string | null
  position?: WorkflowNodePosition | null
}

const DEFAULT_NODE_COLOR = "#3b82f6"

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

function getInitialColor(node: WorkflowNode | null) {
  return node?.color ?? node?.kind.color ?? DEFAULT_NODE_COLOR
}

function createNodeDraftFromNode(node: WorkflowNode): WorkflowNodeDraft {
  return {
    label: node.label,
    description: node.description ?? "",
    color: getInitialColor(node),
    isInitial: node.isInitial,
    isTerminal: node.isTerminal,
  }
}

function createEmptyNodeDraft(kind: WorkflowNodeKind | null): WorkflowNodeDraft {
  return {
    label: "",
    description: "",
    color: kind?.color ?? DEFAULT_NODE_COLOR,
    isInitial: false,
    isTerminal: false,
  }
}

function sortKinds(a: WorkflowNodeKind, b: WorkflowNodeKind) {
  if (a.order !== b.order) return a.order - b.order
  if (a.createdAt !== b.createdAt) return a.createdAt.localeCompare(b.createdAt)
  return a.id.localeCompare(b.id)
}

function normalizeParentId(parentNodeId: string | null | undefined) {
  return parentNodeId ?? null
}

function buildPaletteNodeLabel({
  kind,
  nodes,
  parentNodeId,
}: {
  kind: WorkflowNodeKind
  nodes: WorkflowNode[]
  parentNodeId: string | null
}) {
  const siblingCount = nodes.filter(node =>
    node.kindId === kind.id
    && normalizeParentId(node.parentId) === parentNodeId,
  ).length

  return `${kind.label} ${siblingCount + 1}`
}

function findPaletteCreatedNode(data: CompanyWorkflowResponse, variables: CreateNodeFromPaletteParams) {
  return data.workflow.nodes
    .filter(node =>
      node.kindId === variables.kindId
      && normalizeParentId(node.parentId) === normalizeParentId(variables.parentNodeId),
    )
    .sort((a, b) => {
      if (a.createdAt !== b.createdAt) return b.createdAt.localeCompare(a.createdAt)
      return b.id.localeCompare(a.id)
    })[0] ?? null
}

export function useCompanySettingsPage({
  companyId,
  workflowEditorService,
}: {
  companyId: string | null
  workflowEditorService: WorkflowEditorService
}) {
  const queryClient = useQueryClient()
  const [selectedElement, setSelectedElement] = useState<SelectedWorkflowElement>(null)
  const [createParentNodeId, setCreateParentNodeId] = useState<string | null | undefined>(undefined)
  const [nodeDraft, setNodeDraft] = useState<WorkflowNodeDraft>(() => createEmptyNodeDraft(null))
  const [transitionTypeDraft, setTransitionTypeDraft] = useState("")

  const workflowQuery = useQuery({
    queryKey: ["company-settings", "workflow", companyId],
    queryFn: () => workflowEditorService.getCompanyWorkflow({ companyId: companyId! }),
    enabled: Boolean(companyId),
  })

  const workflow = workflowQuery.data?.workflow ?? null
  const nodes = useMemo(() => workflow?.nodes ?? [], [workflow?.nodes])
  const transitions = useMemo(() => workflow?.transitions ?? [], [workflow?.transitions])
  const nodeKinds = useMemo(() => workflow?.nodeKinds ?? [], [workflow?.nodeKinds])

  const selectedNode = useMemo(() => {
    if (selectedElement?.type !== "node") return null
    return nodes.find(node => node.id === selectedElement.id) ?? null
  }, [nodes, selectedElement])

  const selectedTransition = useMemo(() => {
    if (selectedElement?.type !== "transition") return null
    return transitions.find(transition => transition.id === selectedElement.id) ?? null
  }, [selectedElement, transitions])

  const createParentNode = useMemo(() => {
    if (createParentNodeId === undefined || createParentNodeId === null) return null
    return nodes.find(node => node.id === createParentNodeId) ?? null
  }, [createParentNodeId, nodes])

  const getAllowedChildKind = (parentNodeId: string | null) => {
    const parentNode = parentNodeId ? nodes.find(node => node.id === parentNodeId) ?? null : null
    return nodeKinds
      .filter(kind => kind.parentKindId === (parentNode?.kindId ?? null))
      .sort(sortKinds)[0] ?? null
  }

  const updateWorkflowCaches = async (data: CompanyWorkflowResponse, options?: { invalidateBoard?: boolean }) => {
    queryClient.setQueryData(["company-settings", "workflow", companyId], data)
    queryClient.setQueryData(["licitacoes", "workflow", companyId], data)

    if (options?.invalidateBoard ?? true) {
      await queryClient.invalidateQueries({ queryKey: ["licitacoes", "board", companyId] })
    }
  }

  const updateNodeMutation = useMutation({
    mutationFn: () => {
      if (!companyId || !workflow || !selectedNode) {
        throw new Error("Selecione uma etapa do workflow antes de salvar.")
      }

      return workflowEditorService.updateNode({
        companyId,
        workflowDefinitionId: workflow.id,
        nodeId: selectedNode.id,
        label: nodeDraft.label,
        description: nodeDraft.description,
        color: nodeDraft.color,
        isInitial: nodeDraft.isInitial,
        isTerminal: nodeDraft.isTerminal,
      })
    },
    onSuccess: async (data) => {
      await updateWorkflowCaches(data)
      const updatedNode = data.workflow.nodes.find(node => node.id === selectedNode?.id)
      if (updatedNode) setNodeDraft(createNodeDraftFromNode(updatedNode))
      toast.success("Etapa atualizada.")
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Não foi possível atualizar a etapa."))
    },
  })

  const createNodeMutation = useMutation({
    mutationFn: () => {
      if (!companyId || !workflow || createParentNodeId === undefined) {
        throw new Error("Escolha onde a nova etapa será criada.")
      }

      return workflowEditorService.createNode({
        companyId,
        workflowDefinitionId: workflow.id,
        parentNodeId: createParentNodeId,
        label: nodeDraft.label,
        description: nodeDraft.description,
        color: nodeDraft.color,
        isInitial: nodeDraft.isInitial,
        isTerminal: nodeDraft.isTerminal,
      })
    },
    onSuccess: async (data) => {
      await updateWorkflowCaches(data)
      setCreateParentNodeId(undefined)
      toast.success("Etapa criada.")
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Não foi possível criar a etapa."))
    },
  })

  const createNodeFromPaletteMutation = useMutation({
    mutationFn: (params: CreateNodeFromPaletteParams) => {
      if (!companyId || !workflow) {
        throw new Error("Workflow da empresa não carregado.")
      }

      const kind = nodeKinds.find(item => item.id === params.kindId)
      if (!kind) {
        throw new Error("Tipo de etapa inválido.")
      }

      const parentNodeId = normalizeParentId(params.parentNodeId)

      return workflowEditorService.createNode({
        companyId,
        workflowDefinitionId: workflow.id,
        parentNodeId,
        kindId: kind.id,
        label: buildPaletteNodeLabel({ kind, nodes, parentNodeId }),
        color: kind.color ?? DEFAULT_NODE_COLOR,
        isInitial: false,
        isTerminal: false,
        position: params.position ?? null,
      })
    },
    onSuccess: async (data, variables) => {
      await updateWorkflowCaches(data)
      setCreateParentNodeId(undefined)

      const createdNode = findPaletteCreatedNode(data, variables)
      if (createdNode) {
        setSelectedElement({ type: "node", id: createdNode.id })
        setNodeDraft(createNodeDraftFromNode(createdNode))
      }

      toast.success("Etapa criada.")
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Não foi possível criar a etapa."))
    },
  })

  const deleteNodeMutation = useMutation({
    mutationFn: () => {
      if (!companyId || !workflow || !selectedNode) {
        throw new Error("Selecione uma etapa do workflow antes de excluir.")
      }

      return workflowEditorService.deleteNode({
        companyId,
        workflowDefinitionId: workflow.id,
        nodeId: selectedNode.id,
      })
    },
    onSuccess: async (data) => {
      await updateWorkflowCaches(data)
      setSelectedElement(null)
      toast.success("Etapa excluída.")
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Não foi possível excluir a etapa."))
    },
  })

  const createTransitionMutation = useMutation({
    mutationFn: ({ fromNodeId, toNodeId }: { fromNodeId: string; toNodeId: string }) => {
      if (!companyId || !workflow) {
        throw new Error("Workflow da empresa não carregado.")
      }

      return workflowEditorService.createTransition({
        companyId,
        workflowDefinitionId: workflow.id,
        fromNodeId,
        toNodeId,
      })
    },
    onSuccess: async (data, variables) => {
      await updateWorkflowCaches(data)
      const transition = data.workflow.transitions.find(item =>
        item.fromNodeId === variables.fromNodeId && item.toNodeId === variables.toNodeId)
      if (transition) {
        setSelectedElement({ type: "transition", id: transition.id })
        setTransitionTypeDraft(transition.transitionType ?? "")
      }
      toast.success("Transição criada.")
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Não foi possível criar a transição."))
    },
  })

  const updateTransitionMutation = useMutation({
    mutationFn: () => {
      if (!companyId || !workflow || !selectedTransition) {
        throw new Error("Selecione uma transição antes de salvar.")
      }

      return workflowEditorService.updateTransition({
        companyId,
        workflowDefinitionId: workflow.id,
        transitionId: selectedTransition.id,
        transitionType: transitionTypeDraft,
      })
    },
    onSuccess: async (data) => {
      await updateWorkflowCaches(data)
      toast.success("Transição atualizada.")
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Não foi possível atualizar a transição."))
    },
  })

  const deleteTransitionMutation = useMutation({
    mutationFn: () => {
      if (!companyId || !workflow || !selectedTransition) {
        throw new Error("Selecione uma transição antes de excluir.")
      }

      return workflowEditorService.deleteTransition({
        companyId,
        workflowDefinitionId: workflow.id,
        transitionId: selectedTransition.id,
      })
    },
    onSuccess: async (data) => {
      await updateWorkflowCaches(data)
      setSelectedElement(null)
      toast.success("Transição excluída.")
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Não foi possível excluir a transição."))
    },
  })

  const persistPositionMutation = useMutation({
    mutationFn: ({ nodeId, position }: { nodeId: string; position: WorkflowNodePosition }) => {
      if (!companyId || !workflow) {
        throw new Error("Workflow da empresa não carregado.")
      }

      return workflowEditorService.updateNode({
        companyId,
        workflowDefinitionId: workflow.id,
        nodeId,
        position,
      })
    },
    onSuccess: async (data) => {
      await updateWorkflowCaches(data, { invalidateBoard: false })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Não foi possível salvar a posição da etapa."))
    },
  })

  const selectNode = (node: WorkflowNode) => {
    setCreateParentNodeId(undefined)
    setSelectedElement({ type: "node", id: node.id })
    setNodeDraft(createNodeDraftFromNode(node))
  }

  const selectTransition = (transition: WorkflowTransition) => {
    setCreateParentNodeId(undefined)
    setSelectedElement({ type: "transition", id: transition.id })
    setTransitionTypeDraft(transition.transitionType ?? "")
  }

  const clearSelection = () => {
    setCreateParentNodeId(undefined)
    setSelectedElement(null)
    setNodeDraft(createEmptyNodeDraft(null))
    setTransitionTypeDraft("")
  }

  const startCreateNode = (parentNodeId: string | null) => {
    const childKind = getAllowedChildKind(parentNodeId)
    setSelectedElement(null)
    setCreateParentNodeId(parentNodeId)
    setNodeDraft(createEmptyNodeDraft(childKind))
  }

  const cancelCreateNode = () => {
    setCreateParentNodeId(undefined)
    setNodeDraft(createEmptyNodeDraft(null))
  }

  const updateNodeDraft = (patch: Partial<WorkflowNodeDraft>) => {
    setNodeDraft(current => ({ ...current, ...patch }))
  }

  const selectedNodeHasChildren = selectedNode
    ? nodes.some(node => node.parentId === selectedNode.id)
    : false
  const selectedNodeCanHaveChildren = selectedNode
    ? Boolean(getAllowedChildKind(selectedNode.id))
    : false
  const canNodeHaveChildren = (nodeId: string) => Boolean(getAllowedChildKind(nodeId))
  const canCreateRootNode = Boolean(getAllowedChildKind(null))
  const hasNodeDraftChanges = Boolean(
    selectedNode
    && (
      nodeDraft.label.trim() !== selectedNode.label
      || nodeDraft.description.trim() !== (selectedNode.description ?? "")
      || nodeDraft.color !== getInitialColor(selectedNode)
      || nodeDraft.isInitial !== selectedNode.isInitial
      || nodeDraft.isTerminal !== selectedNode.isTerminal
    ),
  )
  const hasTransitionDraftChanges = Boolean(
    selectedTransition
    && transitionTypeDraft.trim() !== (selectedTransition.transitionType ?? ""),
  )

  return {
    workflow,
    nodes,
    transitions,
    nodeKinds,
    selectedElement,
    selectedNode,
    selectedTransition,
    createParentNode,
    createParentNodeId,
    nodeDraft,
    transitionTypeDraft,
    isLoading: workflowQuery.isLoading,
    isSaving: updateNodeMutation.isPending
      || createNodeMutation.isPending
      || createNodeFromPaletteMutation.isPending
      || deleteNodeMutation.isPending
      || createTransitionMutation.isPending
      || updateTransitionMutation.isPending
      || deleteTransitionMutation.isPending,
    hasNodeDraftChanges,
    hasTransitionDraftChanges,
    selectedNodeHasChildren,
    selectedNodeCanHaveChildren,
    canNodeHaveChildren,
    canCreateRootNode,
    selectNode,
    selectTransition,
    clearSelection,
    startCreateNode,
    cancelCreateNode,
    updateNodeDraft,
    setTransitionTypeDraft,
    saveSelectedNode: () => updateNodeMutation.mutateAsync(),
    createDraftNode: () => createNodeMutation.mutateAsync(),
    createNodeFromPalette: (params: CreateNodeFromPaletteParams) => createNodeFromPaletteMutation.mutateAsync(params),
    deleteSelectedNode: () => deleteNodeMutation.mutateAsync(),
    createTransition: (fromNodeId: string, toNodeId: string) => createTransitionMutation.mutateAsync({ fromNodeId, toNodeId }),
    saveSelectedTransition: () => updateTransitionMutation.mutateAsync(),
    deleteSelectedTransition: () => deleteTransitionMutation.mutateAsync(),
    persistNodePosition: (nodeId: string, position: WorkflowNodePosition) => persistPositionMutation.mutate({ nodeId, position }),
  }
}
