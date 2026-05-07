"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type {
  CompanyWorkflowResponse,
  OportunidadeBoardItem,
  WorkflowNode,
} from "../../../services/use-licitacao.service"
import { useLicitacaoService } from "../../../services/use-licitacao.service"

type LicitacaoService = ReturnType<typeof useLicitacaoService>
type ViewMode = "kanban" | "lista"

type WorkflowMetadata = {
  boardColumnKindKey: string
  primaryBadgeKindKey: string
  secondaryBadgeKindKey: string
}

type WorkflowMoveOption = {
  nodeId: string
  label: string
  transitionType: string | null
  phaseId: string | null
  phaseLabel: string | null
}

const VIEW_STORAGE_KEY = "licitacoes-board:view-mode"

function parseValueFilter(value: string): number | undefined {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".")
  if (!normalized) return undefined

  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

function sortNodes(a: { order: number; createdAt: string; id: string }, b: { order: number; createdAt: string; id: string }) {
  if (a.order !== b.order) return a.order - b.order
  if (a.createdAt !== b.createdAt) return a.createdAt.localeCompare(b.createdAt)
  return a.id.localeCompare(b.id)
}

function readWorkflowMetadata(definition: CompanyWorkflowResponse["workflow"] | undefined): WorkflowMetadata {
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

export function useLicitacoesPage(params: {
  licitacaoService: LicitacaoService
  companyId: string | null
}) {
  const { licitacaoService, companyId } = params
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "kanban"

    const stored = window.localStorage.getItem(VIEW_STORAGE_KEY)
    return stored === "kanban" || stored === "lista" ? stored : "kanban"
  })
  const [search, setSearch] = useState("")
  const [selectedWorkflowNodeIds, setSelectedWorkflowNodeIds] = useState<string[]>([])
  const [selectedResponsavelId, setSelectedResponsavelId] = useState<string>("all")
  const [valorEstimadoMin, setValorEstimadoMin] = useState("")
  const [valorEstimadoMax, setValorEstimadoMax] = useState("")
  const deferredSearch = useDeferredValue(search)
  const deferredValorEstimadoMin = useDeferredValue(valorEstimadoMin)
  const deferredValorEstimadoMax = useDeferredValue(valorEstimadoMax)
  const parsedValorEstimadoMin = parseValueFilter(deferredValorEstimadoMin)
  const parsedValorEstimadoMax = parseValueFilter(deferredValorEstimadoMax)

  const handleChangeViewMode = (nextMode: ViewMode) => {
    setViewMode(nextMode)
    window.localStorage.setItem(VIEW_STORAGE_KEY, nextMode)
  }

  const workflowQuery = useQuery({
    queryKey: ["licitacoes", "workflow", companyId],
    queryFn: () => licitacaoService.getCompanyWorkflow({ companyId: companyId! }),
    enabled: Boolean(companyId),
  })

  const workflow = workflowQuery.data?.workflow
  const workflowMetadata = readWorkflowMetadata(workflow)
  const workflowNodes = useMemo(() => workflow?.nodes ?? [], [workflow?.nodes])
  const workflowNodeIdSet = useMemo(() => {
    return new Set(workflowNodes.map(node => node.id))
  }, [workflowNodes])
  const validSelectedWorkflowNodeIds = useMemo(() => {
    return selectedWorkflowNodeIds.filter(nodeId => workflowNodeIdSet.has(nodeId))
  }, [selectedWorkflowNodeIds, workflowNodeIdSet])
  const sortedSelectedWorkflowNodeIds = useMemo(() => {
    return [...validSelectedWorkflowNodeIds].sort((a, b) => a.localeCompare(b))
  }, [validSelectedWorkflowNodeIds])

  const boardQuery = useQuery({
    queryKey: [
      "licitacoes",
      "board",
      companyId,
      sortedSelectedWorkflowNodeIds,
      selectedResponsavelId,
      parsedValorEstimadoMin,
      parsedValorEstimadoMax,
      deferredSearch,
    ],
    queryFn: () => licitacaoService.listOportunidadesBoard({
      companyId: companyId!,
      workflowNodeIds: sortedSelectedWorkflowNodeIds.length > 0 ? sortedSelectedWorkflowNodeIds : undefined,
      responsavelUserId: selectedResponsavelId !== "all" ? selectedResponsavelId : undefined,
      valorEstimadoMin: parsedValorEstimadoMin,
      valorEstimadoMax: parsedValorEstimadoMax,
      q: deferredSearch.trim() || undefined,
    }),
    enabled: Boolean(companyId),
  })

  const moveMutation = useMutation({
    mutationFn: ({
      oportunidadeId,
      targetNodeId,
    }: {
      oportunidadeId: string
      targetNodeId: string
    }) => licitacaoService.moveOportunidadeWorkflow({
      companyId: companyId!,
      oportunidadeId,
      targetNodeId,
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["licitacoes", "board", companyId] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Não foi possível mover a oportunidade."))
    },
  })

  const nodeById = useMemo(() => {
    const map = new Map<string, WorkflowNode>()
    for (const node of workflowNodes) map.set(node.id, node)
    return map
  }, [workflowNodes])

  const transitionsByFromNodeId = useMemo(() => {
    const map = new Map<string, CompanyWorkflowResponse["workflow"]["transitions"]>()
    for (const transition of workflow?.transitions ?? []) {
      const existing = map.get(transition.fromNodeId) ?? []
      existing.push(transition)
      map.set(transition.fromNodeId, existing)
    }
    return map
  }, [workflow?.transitions])

  const phases = useMemo(() => {
    return workflowNodes
      .filter(node => node.kind.key === workflowMetadata.boardColumnKindKey)
      .sort(sortNodes)
  }, [workflowNodes, workflowMetadata.boardColumnKindKey])

  const boardItems = useMemo(() => boardQuery.data?.items ?? [], [boardQuery.data?.items])

  const responsaveis = useMemo(() => boardQuery.data?.filterOptions.responsaveis ?? [], [boardQuery.data?.filterOptions.responsaveis])
  const getNodeAncestors = (nodeId: string | null) => {
    const ancestors: WorkflowNode[] = []
    let cursor = nodeId ? nodeById.get(nodeId) ?? null : null

    while (cursor) {
      ancestors.push(cursor)
      cursor = cursor.parentId ? nodeById.get(cursor.parentId) ?? null : null
    }

    return ancestors
  }

  const getMoveOptions = (item: OportunidadeBoardItem): WorkflowMoveOption[] => {
    const currentNodeId = item.workflow.currentNode?.id
    if (!currentNodeId) return []
    const currentNodeIds = getNodeAncestors(currentNodeId).map(node => node.id)
    const transitions = Array.from(new Map(
      currentNodeIds
        .flatMap(nodeId => transitionsByFromNodeId.get(nodeId) ?? [])
        .map(transition => [transition.id, transition]),
    ).values())

    return transitions
      .map(transition => {
        const targetNode = nodeById.get(transition.toNodeId)
        if (!targetNode) return null

        const phaseNode = getNodeAncestors(targetNode.id)
          .find(node => node.kind.key === workflowMetadata.boardColumnKindKey) ?? null

        return {
          nodeId: targetNode.id,
          label: targetNode.label,
          transitionType: transition.transitionType,
          phaseId: phaseNode?.id ?? null,
          phaseLabel: phaseNode?.label ?? null,
        } satisfies WorkflowMoveOption
      })
      .filter((option): option is WorkflowMoveOption => Boolean(option))
  }

  const getReachableNodeForPhase = (item: OportunidadeBoardItem, phaseId: string) => {
    const options = getMoveOptions(item).filter(option => option.phaseId === phaseId)
    return options[0] ?? null
  }

  const moveToNode = async (params: { oportunidadeId: string; targetNodeId: string }) => {
    await moveMutation.mutateAsync(params)
  }

  const moveToPhase = async (item: OportunidadeBoardItem, phaseId: string) => {
    const option = getReachableNodeForPhase(item, phaseId)
    if (!option) {
      toast.error("Esta coluna não é um destino válido a partir do status atual.")
      return
    }

    await moveToNode({
      oportunidadeId: item.oportunidadeId,
      targetNodeId: option.nodeId,
    })
  }

  const clearFilters = () => {
    setSearch("")
    setSelectedWorkflowNodeIds([])
    setSelectedResponsavelId("all")
    setValorEstimadoMin("")
    setValorEstimadoMax("")
  }

  const hasActiveFilters = Boolean(
    deferredSearch.trim()
    || validSelectedWorkflowNodeIds.length > 0
    || selectedResponsavelId !== "all"
    || deferredValorEstimadoMin.trim()
    || deferredValorEstimadoMax.trim(),
  )

  return {
    viewMode,
    setViewMode: handleChangeViewMode,
    search,
    setSearch,
    selectedWorkflowNodeIds: validSelectedWorkflowNodeIds,
    setSelectedWorkflowNodeIds,
    selectedResponsavelId,
    setSelectedResponsavelId,
    valorEstimadoMin,
    setValorEstimadoMin,
    valorEstimadoMax,
    setValorEstimadoMax,
    workflow,
    workflowMetadata,
    workflowNodes,
    phases,
    responsaveis,
    items: boardItems,
    total: boardQuery.data?.total ?? 0,
    columnSummaries: boardQuery.data?.columnSummaries ?? [],
    valueRange: boardQuery.data?.filterOptions.valueRange ?? { min: null, max: null },
    isLoading: workflowQuery.isLoading || boardQuery.isLoading,
    isMoving: moveMutation.isPending,
    movingOportunidadeId: moveMutation.variables?.oportunidadeId ?? null,
    moveToNode,
    moveToPhase,
    getMoveOptions,
    getReachableNodeForPhase,
    clearFilters,
    hasActiveFilters,
    emptyState: hasActiveFilters
      ? "Nenhuma oportunidade encontrada com os filtros atuais."
      : "Nenhuma oportunidade ativa cadastrada nesta empresa ainda.",
  }
}
