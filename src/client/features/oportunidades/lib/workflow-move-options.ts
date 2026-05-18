import type {
  CompanyWorkflowResponse,
  OportunidadeBoardItem,
  WorkflowNode,
} from "@/client/features/licitacoes/services/use-licitacao.service"

export type WorkflowMetadata = {
  boardColumnKindKey: string
  primaryBadgeKindKey: string
  secondaryBadgeKindKey: string
}

export type WorkflowMoveOptionKind = "phase" | "status" | "situation"

export type WorkflowMoveOption = {
  nodeId: string
  label: string
  transitionType: string | null
  phaseId: string | null
  phaseLabel: string | null
  kind: WorkflowMoveOptionKind
}

type RankedWorkflowMoveOption = WorkflowMoveOption & {
  semanticNodeId: string
  kindPriority: number
  phaseOrder: number
  nodeOrder: number
  sourceDepth: number
}

type WorkflowContext = {
  phase: WorkflowNode | null
  status: WorkflowNode | null
  situation: WorkflowNode | null
  ancestors: WorkflowNode[]
}

function sortNodes(a: { order: number; createdAt: string; id: string }, b: { order: number; createdAt: string; id: string }) {
  if (a.order !== b.order) return a.order - b.order
  if (a.createdAt !== b.createdAt) return a.createdAt.localeCompare(b.createdAt)
  return a.id.localeCompare(b.id)
}

function isBackwardTransitionType(value: string | null) {
  if (!value) return false

  const normalized = value.trim().toLowerCase()
  return ["retorno", "return", "back", "reopen", "resume"].includes(normalized)
}

function getMoveOptionKindPriority(kind: WorkflowMoveOptionKind) {
  if (kind === "phase") return 0
  if (kind === "status") return 1
  return 2
}

function compareMoveOptionRank(a: RankedWorkflowMoveOption, b: RankedWorkflowMoveOption) {
  if (a.kindPriority !== b.kindPriority) return a.kindPriority - b.kindPriority
  if (a.phaseOrder !== b.phaseOrder) return a.phaseOrder - b.phaseOrder
  if (a.nodeOrder !== b.nodeOrder) return a.nodeOrder - b.nodeOrder
  if (a.sourceDepth !== b.sourceDepth) return a.sourceDepth - b.sourceDepth
  return a.label.localeCompare(b.label)
}

function getNodeAncestors(nodeId: string | null, nodeById: Map<string, WorkflowNode>) {
  const ancestors: WorkflowNode[] = []
  let cursor = nodeId ? nodeById.get(nodeId) ?? null : null

  while (cursor) {
    ancestors.push(cursor)
    cursor = cursor.parentId ? nodeById.get(cursor.parentId) ?? null : null
  }

  return ancestors
}

function getContextNode(
  explicitNodeId: string | null | undefined,
  fallbackAncestors: WorkflowNode[],
  kindKey: string,
  nodeById: Map<string, WorkflowNode>,
) {
  if (explicitNodeId) {
    const explicitNode = nodeById.get(explicitNodeId)
    if (explicitNode) return explicitNode
  }

  return fallbackAncestors.find(node => node.kind.key === kindKey) ?? null
}

function getWorkflowContext(params: {
  currentNodeId: string | null
  explicitPhaseNodeId?: string | null
  explicitStatusNodeId?: string | null
  explicitSituationNodeId?: string | null
  metadata: WorkflowMetadata
  nodeById: Map<string, WorkflowNode>
}) {
  const { currentNodeId, explicitPhaseNodeId, explicitStatusNodeId, explicitSituationNodeId, metadata, nodeById } = params
  const ancestors = getNodeAncestors(currentNodeId, nodeById)

  return {
    phase: getContextNode(explicitPhaseNodeId, ancestors, metadata.boardColumnKindKey, nodeById),
    status: getContextNode(explicitStatusNodeId, ancestors, metadata.primaryBadgeKindKey, nodeById),
    situation: getContextNode(explicitSituationNodeId, ancestors, metadata.secondaryBadgeKindKey, nodeById),
    ancestors,
  } satisfies WorkflowContext
}

function buildRankedWorkflowMoveOption(params: {
  item: OportunidadeBoardItem
  transition: CompanyWorkflowResponse["workflow"]["transitions"][number]
  targetNode: WorkflowNode
  currentContext: WorkflowContext
  targetContext: WorkflowContext
  sourceDepth: number
}): RankedWorkflowMoveOption | null {
  const { item, transition, targetNode, currentContext, targetContext, sourceDepth } = params
  const currentPhaseNode = currentContext.phase
  const currentStatusNode = currentContext.status
  const currentSituationNode = currentContext.situation
  const targetPhaseNode = targetContext.phase
  const targetStatusNode = targetContext.status
  const targetSituationNode = targetContext.situation

  if (currentPhaseNode && targetPhaseNode && targetPhaseNode.id !== currentPhaseNode.id) {
    if (sortNodes(targetPhaseNode, currentPhaseNode) < 0) return null

    return {
      nodeId: targetNode.id,
      label: targetPhaseNode.label,
      transitionType: transition.transitionType,
      phaseId: targetPhaseNode.id,
      phaseLabel: targetPhaseNode.label,
      kind: "phase",
      semanticNodeId: targetPhaseNode.id,
      kindPriority: getMoveOptionKindPriority("phase"),
      phaseOrder: targetPhaseNode.order,
      nodeOrder: targetPhaseNode.order,
      sourceDepth,
    } satisfies RankedWorkflowMoveOption
  }

  if (targetStatusNode && (!currentStatusNode || targetStatusNode.id !== currentStatusNode.id)) {
    return {
      nodeId: targetNode.id,
      label: targetStatusNode.label,
      transitionType: transition.transitionType,
      phaseId: targetPhaseNode?.id ?? item.workflow.phase?.id ?? null,
      phaseLabel: targetPhaseNode?.label ?? item.workflow.phase?.label ?? null,
      kind: "status",
      semanticNodeId: targetStatusNode.id,
      kindPriority: getMoveOptionKindPriority("status"),
      phaseOrder: targetPhaseNode?.order ?? Number.MAX_SAFE_INTEGER,
      nodeOrder: targetStatusNode.order,
      sourceDepth,
    } satisfies RankedWorkflowMoveOption
  }

  if (targetSituationNode && (!currentSituationNode || targetSituationNode.id !== currentSituationNode.id)) {
    return {
      nodeId: targetNode.id,
      label: targetSituationNode.label,
      transitionType: transition.transitionType,
      phaseId: targetPhaseNode?.id ?? item.workflow.phase?.id ?? null,
      phaseLabel: targetPhaseNode?.label ?? item.workflow.phase?.label ?? null,
      kind: "situation",
      semanticNodeId: targetSituationNode.id,
      kindPriority: getMoveOptionKindPriority("situation"),
      phaseOrder: targetPhaseNode?.order ?? Number.MAX_SAFE_INTEGER,
      nodeOrder: targetSituationNode.order,
      sourceDepth,
    } satisfies RankedWorkflowMoveOption
  }

  return null
}

export function readWorkflowMetadata(definition: CompanyWorkflowResponse["workflow"] | undefined): WorkflowMetadata {
  const raw = definition?.metadata
  const object = raw && typeof raw === "object" && !Array.isArray(raw)
    ? raw as Record<string, unknown>
    : {}

  return {
    boardColumnKindKey: typeof object.boardColumnKindKey === "string" ? object.boardColumnKindKey : "phase",
    primaryBadgeKindKey: typeof object.primaryBadgeKindKey === "string" ? object.primaryBadgeKindKey : "status",
    secondaryBadgeKindKey: typeof object.secondaryBadgeKindKey === "string" ? object.secondaryBadgeKindKey : "situation",
  }
}

export function buildWorkflowMoveOptions(params: {
  item: OportunidadeBoardItem
  workflowMetadata: WorkflowMetadata
  nodeById: Map<string, WorkflowNode>
  transitionsByFromNodeId: Map<string, CompanyWorkflowResponse["workflow"]["transitions"]>
}) {
  const { item, workflowMetadata, nodeById, transitionsByFromNodeId } = params
  const currentNodeId = item.workflow.currentNode?.id ?? null
  if (!currentNodeId) return []

  const currentContext = getWorkflowContext({
    currentNodeId,
    explicitPhaseNodeId: item.workflow.phase?.id,
    explicitStatusNodeId: item.workflow.status?.id,
    explicitSituationNodeId: item.workflow.situation?.id,
    metadata: workflowMetadata,
    nodeById,
  })

  const currentNodeIds = new Set(currentContext.ancestors.map(node => node.id))
  const transitions = Array.from(new Map(
    currentContext.ancestors
      .flatMap(node => transitionsByFromNodeId.get(node.id) ?? [])
      .map(transition => [transition.id, transition]),
  ).values())

  const transitionOptions = transitions
    .map(transition => {
      if (isBackwardTransitionType(transition.transitionType)) return null

      const targetNode = nodeById.get(transition.toNodeId)
      if (!targetNode) return null
      if (currentNodeIds.has(targetNode.id)) return null

      const targetContext = getWorkflowContext({
        currentNodeId: targetNode.id,
        metadata: workflowMetadata,
        nodeById,
      })

      const sourceDepth = currentContext.ancestors.findIndex(node => node.id === transition.fromNodeId)
      if (sourceDepth < 0) return null

      return buildRankedWorkflowMoveOption({
        item,
        transition,
        targetNode,
        currentContext,
        targetContext,
        sourceDepth,
      })
    })
    .filter((option): option is RankedWorkflowMoveOption => Boolean(option))

  const optionsBySemanticNodeId = new Map<string, RankedWorkflowMoveOption>()

  for (const option of transitionOptions) {
    const key = `${option.kind}:${option.semanticNodeId}`
    const currentOption = optionsBySemanticNodeId.get(key)

    if (!currentOption || compareMoveOptionRank(option, currentOption) < 0) {
      optionsBySemanticNodeId.set(key, option)
    }
  }

  return Array.from(optionsBySemanticNodeId.values())
    .sort(compareMoveOptionRank)
    .map(option => ({
      nodeId: option.nodeId,
      label: option.label,
      transitionType: option.transitionType,
      phaseId: option.phaseId,
      phaseLabel: option.phaseLabel,
      kind: option.kind,
    }))
}
