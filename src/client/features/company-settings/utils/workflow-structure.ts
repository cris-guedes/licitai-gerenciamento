import type { WorkflowNode, WorkflowNodeKind, WorkflowTransition } from "../types/workflow"

export function sortWorkflowNodes(a: WorkflowNode, b: WorkflowNode) {
  if (a.order !== b.order) return a.order - b.order
  if (a.createdAt !== b.createdAt) return a.createdAt.localeCompare(b.createdAt)
  return a.id.localeCompare(b.id)
}

export function sortWorkflowKinds(a: WorkflowNodeKind, b: WorkflowNodeKind) {
  if (a.order !== b.order) return a.order - b.order
  if (a.createdAt !== b.createdAt) return a.createdAt.localeCompare(b.createdAt)
  return a.id.localeCompare(b.id)
}

export function buildChildrenByParentId(nodes: WorkflowNode[]) {
  const map = new Map<string | null, WorkflowNode[]>()

  for (const node of [...nodes].sort(sortWorkflowNodes)) {
    const key = node.parentId ?? null
    const siblings = map.get(key) ?? []
    siblings.push(node)
    map.set(key, siblings)
  }

  return map
}

export function buildKindsByParentKindId(nodeKinds: WorkflowNodeKind[]) {
  const map = new Map<string | null, WorkflowNodeKind[]>()

  for (const kind of [...nodeKinds].sort(sortWorkflowKinds)) {
    const key = kind.parentKindId ?? null
    const siblings = map.get(key) ?? []
    siblings.push(kind)
    map.set(key, siblings)
  }

  return map
}

export function buildNodeById(nodes: WorkflowNode[]) {
  return new Map(nodes.map(node => [node.id, node]))
}

export function buildRootNodeIdByNodeId(nodes: WorkflowNode[]) {
  const nodeById = buildNodeById(nodes)
  const rootNodeIdByNodeId = new Map<string, string>()

  for (const node of nodes) {
    let current: WorkflowNode | undefined = node

    while (current?.parentId) {
      current = nodeById.get(current.parentId)
    }

    rootNodeIdByNodeId.set(node.id, current?.id ?? node.id)
  }

  return rootNodeIdByNodeId
}

export function getAllowedChildKind({
  parentNode,
  nodeKindsByParentKindId,
}: {
  parentNode: WorkflowNode | null
  nodeKindsByParentKindId: Map<string | null, WorkflowNodeKind[]>
}) {
  return nodeKindsByParentKindId.get(parentNode?.kindId ?? null)?.[0] ?? null
}

export function collectSubtreeNodeIds({
  rootNodeId,
  childrenByParentId,
}: {
  rootNodeId: string
  childrenByParentId: Map<string | null, WorkflowNode[]>
}) {
  const ids = new Set<string>()
  const queue = [rootNodeId]

  while (queue.length > 0) {
    const currentId = queue.shift()
    if (!currentId || ids.has(currentId)) continue

    ids.add(currentId)

    for (const child of childrenByParentId.get(currentId) ?? []) {
      queue.push(child.id)
    }
  }

  return ids
}

export function collectColumnTransitions({
  rootNodeId,
  childrenByParentId,
  transitions,
}: {
  rootNodeId: string
  childrenByParentId: Map<string | null, WorkflowNode[]>
  transitions: WorkflowTransition[]
}) {
  const subtreeIds = collectSubtreeNodeIds({ rootNodeId, childrenByParentId })

  return transitions.filter(transition =>
    subtreeIds.has(transition.fromNodeId) && subtreeIds.has(transition.toNodeId),
  )
}

export function groupKindsByDepth(nodeKinds: WorkflowNodeKind[]) {
  const kindById = new Map(nodeKinds.map(kind => [kind.id, kind]))
  const depthById = new Map<string, number>()

  const resolveDepth = (kind: WorkflowNodeKind): number => {
    const cached = depthById.get(kind.id)
    if (typeof cached === "number") return cached

    const parent = kind.parentKindId ? kindById.get(kind.parentKindId) ?? null : null
    const depth = parent ? resolveDepth(parent) + 1 : 0
    depthById.set(kind.id, depth)
    return depth
  }

  const groups = new Map<number, WorkflowNodeKind[]>()

  for (const kind of [...nodeKinds].sort(sortWorkflowKinds)) {
    const depth = resolveDepth(kind)
    const items = groups.get(depth) ?? []
    items.push(kind)
    groups.set(depth, items)
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left - right)
    .map(([depth, kinds]) => ({ depth, kinds }))
}
