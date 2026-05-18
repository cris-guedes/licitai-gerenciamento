"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  buildWorkflowMoveOptions,
  readWorkflowMetadata,
  type WorkflowMoveOption,
} from "@/client/features/oportunidades/lib/workflow-move-options"
import type {
  CompanyWorkflowResponse,
  CreateOportunidadeItemPayload,
  DeleteOportunidadeItemPayload,
  OportunidadeBoardItem,
  UpdateOportunidadeItemPayload,
  WorkflowNode,
} from "../../../services/use-licitacao.service"
import { useLicitacaoService } from "../../../services/use-licitacao.service"

type LicitacaoService = ReturnType<typeof useLicitacaoService>
type ViewMode = "kanban" | "lista"

type ResponsavelOption = {
  id: string
  name: string
  email: string
}

type UpdateDetailPatch = {
  responsavelUserId?: string | null
  phaseNodeId?: string
  statusNodeId?: string
  situationNodeId?: string
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

export function useLicitacoesPage(params: {
  licitacaoService: LicitacaoService
  companyId: string | null
  organizationId: string | null
  initialDetailOportunidadeId?: string | null
}) {
  const { licitacaoService, companyId, organizationId, initialDetailOportunidadeId = null } = params
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
  const [detailOportunidadeId, setDetailOportunidadeId] = useState<string | null>(null)
  const [detailItemSnapshot, setDetailItemSnapshot] = useState<OportunidadeBoardItem | null>(null)
  const requestedDetailOportunidadeId = detailOportunidadeId ?? initialDetailOportunidadeId ?? null
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

  const teamMembersQuery = useQuery({
    queryKey: ["team", "members", organizationId],
    queryFn: () => licitacaoService.listTeamMembers({ organizationId: organizationId! }),
    enabled: Boolean(organizationId),
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
    onSuccess: (response) => {
      const phaseLabel = response.item.workflow.phase?.label
      toast.success(phaseLabel ? `Oportunidade movida para ${phaseLabel}.` : "Oportunidade movida com sucesso.")
      void queryClient.invalidateQueries({ queryKey: ["licitacoes", "board", companyId] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Não foi possível mover a oportunidade."))
    },
  })

  const updateDetailMutation = useMutation({
    mutationFn: ({
      oportunidadeId,
      ...patch
    }: UpdateDetailPatch & {
      oportunidadeId: string
    }) => licitacaoService.updateOportunidadeBoardItem({
      companyId: companyId!,
      oportunidadeId,
      ...patch,
    }),
    onSuccess: (response, variables) => {
      if (requestedDetailOportunidadeId === variables.oportunidadeId) {
        setDetailItemSnapshot(response.item)
      }

      const workflowUpdated = Boolean(variables.phaseNodeId || variables.statusNodeId || variables.situationNodeId)
      toast.success(workflowUpdated ? "Workflow da oportunidade atualizado." : "Oportunidade atualizada com sucesso.")
      void queryClient.invalidateQueries({ queryKey: ["licitacoes", "board", companyId] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Não foi possível atualizar a oportunidade."))
    },
  })

  const createBoardNoteMutation = useMutation({
    mutationFn: ({
      oportunidadeId,
      content,
    }: {
      oportunidadeId: string
      content: string
    }) => licitacaoService.createOportunidadeNote({
      companyId: companyId!,
      oportunidadeId,
      content,
    }),
    onSuccess: (_response, variables) => {
      toast.success("Comentário salvo.")
      if (requestedDetailOportunidadeId === variables.oportunidadeId) {
        void queryClient.invalidateQueries({ queryKey: ["licitacoes", "workspace", companyId, variables.oportunidadeId] })
      }
      void queryClient.invalidateQueries({ queryKey: ["licitacoes", "board", companyId] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Não foi possível salvar o comentário."))
    },
  })

  const updateDetailItemMutation = useMutation({
    mutationFn: ({
      oportunidadeId,
      ...payload
    }: Omit<UpdateOportunidadeItemPayload, "companyId" | "oportunidadeId"> & {
      oportunidadeId: string
    }) => licitacaoService.updateOportunidadeItem({
      companyId: companyId!,
      oportunidadeId,
      ...payload,
    }),
    onSuccess: (_response, variables) => {
      toast.success("Item da oportunidade atualizado.")
      if (requestedDetailOportunidadeId === variables.oportunidadeId) {
        void queryClient.invalidateQueries({ queryKey: ["licitacoes", "workspace", companyId, variables.oportunidadeId] })
      }
      void queryClient.invalidateQueries({ queryKey: ["licitacoes", "board", companyId] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Não foi possível atualizar o item da oportunidade."))
    },
  })

  const createDetailItemMutation = useMutation({
    mutationFn: ({
      oportunidadeId,
      ...payload
    }: Omit<CreateOportunidadeItemPayload, "companyId" | "oportunidadeId"> & {
      oportunidadeId: string
    }) => licitacaoService.createOportunidadeItem({
      companyId: companyId!,
      oportunidadeId,
      ...payload,
    }),
    onSuccess: (_response, variables) => {
      toast.success("Item adicionado à oportunidade.")
      if (requestedDetailOportunidadeId === variables.oportunidadeId) {
        void queryClient.invalidateQueries({ queryKey: ["licitacoes", "workspace", companyId, variables.oportunidadeId] })
      }
      void queryClient.invalidateQueries({ queryKey: ["licitacoes", "board", companyId] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Não foi possível adicionar o item."))
    },
  })

  const deleteDetailItemMutation = useMutation({
    mutationFn: ({
      oportunidadeId,
      ...payload
    }: Omit<DeleteOportunidadeItemPayload, "companyId" | "oportunidadeId"> & {
      oportunidadeId: string
    }) => licitacaoService.deleteOportunidadeItem({
      companyId: companyId!,
      oportunidadeId,
      ...payload,
    }),
    onSuccess: (_response, variables) => {
      toast.success("Item removido da oportunidade.")
      if (requestedDetailOportunidadeId === variables.oportunidadeId) {
        void queryClient.invalidateQueries({ queryKey: ["licitacoes", "workspace", companyId, variables.oportunidadeId] })
      }
      void queryClient.invalidateQueries({ queryKey: ["licitacoes", "board", companyId] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Não foi possível remover o item."))
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

  const selectedDetailItem = useMemo(() => {
    if (!requestedDetailOportunidadeId) return null

    return (detailItemSnapshot?.oportunidadeId === requestedDetailOportunidadeId ? detailItemSnapshot : null)
      ?? boardItems.find(item => item.oportunidadeId === requestedDetailOportunidadeId)
      ?? null
  }, [boardItems, detailItemSnapshot, requestedDetailOportunidadeId])

  const responsaveis = useMemo(() => boardQuery.data?.filterOptions.responsaveis ?? [], [boardQuery.data?.filterOptions.responsaveis])
  const responsavelOptions = useMemo(() => {
    const byId = new Map<string, ResponsavelOption>()

    for (const member of teamMembersQuery.data?.members ?? []) {
      byId.set(member.userId, {
        id: member.userId,
        name: member.name,
        email: member.email,
      })
    }

    for (const responsavel of responsaveis) {
      byId.set(responsavel.id, responsavel)
    }

    if (selectedDetailItem?.responsavel) {
      byId.set(selectedDetailItem.responsavel.id, selectedDetailItem.responsavel)
    }

    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [responsaveis, selectedDetailItem, teamMembersQuery.data?.members])

  const getMoveOptions = (item: OportunidadeBoardItem): WorkflowMoveOption[] => {
    return buildWorkflowMoveOptions({
      item,
      workflowMetadata,
      nodeById,
      transitionsByFromNodeId,
    })
  }

  const getReachableNodeForPhase = (item: OportunidadeBoardItem, phaseId: string) => {
    const options = getMoveOptions(item).filter(option => option.phaseId === phaseId)
    return options[0] ?? null
  }

  const moveToNode = async (params: { oportunidadeId: string; targetNodeId: string }) => {
    const response = await moveMutation.mutateAsync(params)

    if (requestedDetailOportunidadeId === params.oportunidadeId) {
      setDetailItemSnapshot(response.item)
    }
  }

  const updateDetailItem = async (patch: UpdateDetailPatch) => {
    if (!selectedDetailItem) return

    await updateDetailMutation.mutateAsync({
      oportunidadeId: selectedDetailItem.oportunidadeId,
      ...patch,
    })
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

  const detailWorkspaceQuery = useQuery({
    queryKey: ["licitacoes", "workspace", companyId, requestedDetailOportunidadeId],
    queryFn: () => licitacaoService.getWorkspace({
      companyId: companyId!,
      oportunidadeId: requestedDetailOportunidadeId!,
    }),
    enabled: Boolean(companyId && requestedDetailOportunidadeId),
  })

  const openDetail = (item: OportunidadeBoardItem) => {
    setDetailOportunidadeId(item.oportunidadeId)
    setDetailItemSnapshot(item)
  }

  const closeDetail = () => {
    setDetailOportunidadeId(null)
    setDetailItemSnapshot(null)
  }

  const createBoardNote = async (params: { oportunidadeId: string; content: string }) => {
    await createBoardNoteMutation.mutateAsync(params)
  }

  const updateDetailWorkspaceItem = async (payload: Omit<UpdateOportunidadeItemPayload, "companyId" | "oportunidadeId">) => {
    if (!selectedDetailItem) return

    await updateDetailItemMutation.mutateAsync({
      oportunidadeId: selectedDetailItem.oportunidadeId,
      ...payload,
    })
  }

  const createDetailWorkspaceItem = async (payload: Omit<CreateOportunidadeItemPayload, "companyId" | "oportunidadeId">) => {
    if (!selectedDetailItem) return

    await createDetailItemMutation.mutateAsync({
      oportunidadeId: selectedDetailItem.oportunidadeId,
      ...payload,
    })
  }

  const deleteDetailWorkspaceItem = async (payload: Omit<DeleteOportunidadeItemPayload, "companyId" | "oportunidadeId">) => {
    if (!selectedDetailItem) return

    await deleteDetailItemMutation.mutateAsync({
      oportunidadeId: selectedDetailItem.oportunidadeId,
      ...payload,
    })
  }

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
    responsavelOptions,
    items: boardItems,
    total: boardQuery.data?.total ?? 0,
    columnSummaries: boardQuery.data?.columnSummaries ?? [],
    valueRange: boardQuery.data?.filterOptions.valueRange ?? { min: null, max: null },
    isLoading: workflowQuery.isLoading || boardQuery.isLoading,
    isMoving: moveMutation.isPending,
    isUpdatingDetail: updateDetailMutation.isPending,
    isUpdatingDetailItems: updateDetailItemMutation.isPending || createDetailItemMutation.isPending || deleteDetailItemMutation.isPending,
    movingOportunidadeId: moveMutation.isPending ? moveMutation.variables?.oportunidadeId ?? null : null,
    creatingCommentOportunidadeId: createBoardNoteMutation.isPending
      ? createBoardNoteMutation.variables?.oportunidadeId ?? null
      : null,
    moveToNode,
    moveToPhase,
    updateDetailItem,
    updateDetailWorkspaceItem,
    createDetailWorkspaceItem,
    deleteDetailWorkspaceItem,
    createBoardNote,
    getMoveOptions,
    getReachableNodeForPhase,
    clearFilters,
    hasActiveFilters,
    selectedDetailItem,
    detailWorkspace: detailWorkspaceQuery.data ?? null,
    isDetailLoading: detailWorkspaceQuery.isLoading,
    detailError: detailWorkspaceQuery.error,
    isDetailOpen: requestedDetailOportunidadeId !== null && selectedDetailItem !== null,
    openDetail,
    closeDetail,
    emptyState: hasActiveFilters
      ? "Nenhuma oportunidade encontrada com os filtros atuais."
      : "Nenhuma oportunidade ativa cadastrada nesta empresa ainda.",
  }
}
