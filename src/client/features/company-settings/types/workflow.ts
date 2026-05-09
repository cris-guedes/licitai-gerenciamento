export type WorkflowNodeKind = {
  id: string
  key: string
  label: string
  description: string | null
  order: number
  parentKindId: string | null
  color: string | null
  metadata: unknown
  createdAt: string
  updatedAt: string
}

export type WorkflowNode = {
  id: string
  kindId: string
  parentId: string | null
  key: string
  label: string
  description: string | null
  order: number
  depth: number
  path: string
  color: string | null
  isInitial: boolean
  isTerminal: boolean
  metadata: unknown
  createdAt: string
  updatedAt: string
  kind: {
    id: string
    key: string
    label: string
    order: number
    parentKindId: string | null
    color: string | null
  }
}

export type WorkflowTransition = {
  id: string
  fromNodeId: string
  toNodeId: string
  transitionType: string | null
  metadata: unknown
  createdAt: string
  updatedAt: string
}

export type WorkflowNodeDraft = {
  label: string
  description: string
  color: string
  isInitial: boolean
  isTerminal: boolean
}

export type CompanyWorkflow = {
  id: string
  companyId: string
  name: string
  slug: string
  version: number
  isActive: boolean
  metadata: unknown
  createdAt: string
  updatedAt: string
  nodeKinds: WorkflowNodeKind[]
  nodes: WorkflowNode[]
  transitions: WorkflowTransition[]
}

export type CompanyWorkflowResponse = {
  workflow: CompanyWorkflow
}

export type WorkflowNodePosition = {
  x: number
  y: number
}
