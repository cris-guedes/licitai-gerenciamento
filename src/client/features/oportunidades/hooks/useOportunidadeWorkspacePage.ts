"use client"

import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useCoreApi } from "@/client/hooks/use-core-api"
import { useDocumentChatService } from "@/client/features/licitacoes/services/use-document-chat.service"
import { useDocumentSummaryService } from "@/client/features/licitacoes/services/use-document-summary.service"
import { useLicitacaoService } from "@/client/features/licitacoes/services/use-licitacao.service"
import type {
  CompanyWorkflowResponse,
  OportunidadeBoardItem,
  UpdateOportunidadeDetailsPayload,
  WorkflowNode,
} from "@/client/features/licitacoes/services/use-licitacao.service"
import {
  buildOportunidadeWorkspaceModel,
  getResponsavelOptions,
  isWorkflowNodeDescendant,
  sortWorkflowNodes,
} from "../lib/oportunidade-workspace"

type WorkflowMetadata = {
  boardColumnKindKey: string
  primaryBadgeKindKey: string
  secondaryBadgeKindKey: string
}

type MoveOption = {
  nodeId: string
  label: string
  transitionType: string | null
  phaseId: string | null
  phaseLabel: string | null
}

type QuickUpdatePatch = {
  responsavelUserId?: string | null
  phaseNodeId?: string
  statusNodeId?: string
  situationNodeId?: string
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

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

function sortNodes(a: { order: number; createdAt: string; id: string }, b: { order: number; createdAt: string; id: string }) {
  if (a.order !== b.order) return a.order - b.order
  if (a.createdAt !== b.createdAt) return a.createdAt.localeCompare(b.createdAt)
  return a.id.localeCompare(b.id)
}

export function useOportunidadeWorkspacePage(params: {
  companyId: string
  organizationId: string
  oportunidadeId: string
}) {
  const { companyId, organizationId, oportunidadeId } = params
  const api = useCoreApi()
  const licitacaoService = useLicitacaoService(api)
  const documentChatService = useDocumentChatService(api)
  const documentSummaryService = useDocumentSummaryService(api)
  const queryClient = useQueryClient()

  const workflowQuery = useQuery({
    queryKey: ["licitacoes", "workflow", companyId],
    queryFn: () => licitacaoService.getCompanyWorkflow({ companyId }),
  })

  const teamMembersQuery = useQuery({
    queryKey: ["team", "members", organizationId],
    queryFn: () => licitacaoService.listTeamMembers({ organizationId }),
  })

  const boardQuery = useQuery({
    queryKey: ["licitacoes", "board", companyId, "workspace", oportunidadeId],
    queryFn: () => licitacaoService.listOportunidadesBoard({ companyId }),
  })

  const detailWorkspaceQuery = useQuery({
    queryKey: ["licitacoes", "workspace", companyId, oportunidadeId],
    queryFn: () => licitacaoService.getWorkspace({
      companyId,
      oportunidadeId,
    }),
  })

  const moveMutation = useMutation({
    mutationFn: ({
      oportunidadeId: targetOportunidadeId,
      targetNodeId,
    }: {
      oportunidadeId: string
      targetNodeId: string
    }) => licitacaoService.moveOportunidadeWorkflow({
      companyId,
      oportunidadeId: targetOportunidadeId,
      targetNodeId,
    }),
    onSuccess: response => {
      const phaseLabel = response.item.workflow.phase?.label
      toast.success(phaseLabel ? `Oportunidade movida para ${phaseLabel}.` : "Oportunidade movida com sucesso.")
      void queryClient.invalidateQueries({ queryKey: ["licitacoes", "board", companyId] })
      void queryClient.invalidateQueries({ queryKey: ["licitacoes", "workspace", companyId, oportunidadeId] })
    },
    onError: error => {
      toast.error(getErrorMessage(error, "Não foi possível mover a oportunidade."))
    },
  })

  const updateDetailMutation = useMutation({
    mutationFn: ({
      oportunidadeId: targetOportunidadeId,
      ...patch
    }: QuickUpdatePatch & { oportunidadeId: string }) => licitacaoService.updateOportunidadeBoardItem({
      companyId,
      oportunidadeId: targetOportunidadeId,
      ...patch,
    }),
    onSuccess: (_response, variables) => {
      const workflowUpdated = Boolean(variables.phaseNodeId || variables.statusNodeId || variables.situationNodeId)
      toast.success(workflowUpdated ? "Workflow da oportunidade atualizado." : "Oportunidade atualizada com sucesso.")
      void queryClient.invalidateQueries({ queryKey: ["licitacoes", "board", companyId] })
      void queryClient.invalidateQueries({ queryKey: ["licitacoes", "workspace", companyId, oportunidadeId] })
    },
    onError: error => {
      toast.error(getErrorMessage(error, "Não foi possível atualizar a oportunidade."))
    },
  })

  const updateDetailsMutation = useMutation({
    mutationFn: (payload: Omit<UpdateOportunidadeDetailsPayload, "companyId" | "oportunidadeId">) => {
      if (!selectedItem) {
        throw new Error("Nenhuma oportunidade selecionada para atualização.")
      }

      return licitacaoService.updateOportunidadeDetails({
        companyId,
        oportunidadeId: selectedItem.oportunidadeId,
        ...payload,
      })
    },
    onSuccess: () => {
      toast.success("Dados da oportunidade atualizados.")
      void queryClient.invalidateQueries({ queryKey: ["licitacoes", "board", companyId] })
      void queryClient.invalidateQueries({ queryKey: ["licitacoes", "workspace", companyId, oportunidadeId] })
    },
    onError: error => {
      toast.error(getErrorMessage(error, "Não foi possível atualizar os dados da oportunidade."))
    },
  })

  const workflow = workflowQuery.data?.workflow
  const workflowMetadata = readWorkflowMetadata(workflow)
  const workflowNodes = useMemo(() => workflow?.nodes ?? [], [workflow?.nodes])
  const boardItems = boardQuery.data?.items ?? []
  const selectedItem = boardItems.find(item => item.oportunidadeId === oportunidadeId) ?? null
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
  }, [workflowMetadata.boardColumnKindKey, workflowNodes])

  const getNodeAncestors = (nodeId: string | null) => {
    const ancestors: WorkflowNode[] = []
    let cursor = nodeId ? nodeById.get(nodeId) ?? null : null

    while (cursor) {
      ancestors.push(cursor)
      cursor = cursor.parentId ? nodeById.get(cursor.parentId) ?? null : null
    }

    return ancestors
  }

  const getMoveOptions = (item: OportunidadeBoardItem): MoveOption[] => {
    const currentNodeId = item.workflow.currentNode?.id
    if (!currentNodeId) return []

    const currentNodeIds = getNodeAncestors(currentNodeId).map(node => node.id)
    const currentPhaseNode = item.workflow.phase?.id
      ? nodeById.get(item.workflow.phase.id) ?? null
      : getNodeAncestors(currentNodeId).find(node => node.kind.key === workflowMetadata.boardColumnKindKey) ?? null

    const transitions = Array.from(new Map(
      currentNodeIds
        .flatMap(nodeId => transitionsByFromNodeId.get(nodeId) ?? [])
        .map(transition => [transition.id, transition]),
    ).values())

    const transitionOptions = transitions
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
        } satisfies MoveOption
      })
      .filter((option): option is MoveOption => Boolean(option))

    const optionsByNodeId = new Map(transitionOptions.map(option => [option.nodeId, option]))

    if (currentPhaseNode) {
      for (const phase of phases) {
        if (phase.id === currentPhaseNode.id || sortNodes(phase, currentPhaseNode) >= 0) continue
        if (optionsByNodeId.has(phase.id)) continue

        optionsByNodeId.set(phase.id, {
          nodeId: phase.id,
          label: `Voltar para ${phase.label}`,
          transitionType: "retorno",
          phaseId: phase.id,
          phaseLabel: phase.label,
        })
      }
    }

    return Array.from(optionsByNodeId.values())
  }

  const workspaceModel = selectedItem
    ? buildOportunidadeWorkspaceModel({
      companyId,
      item: selectedItem,
      workspace: detailWorkspaceQuery.data ?? null,
    })
    : null

  const currentPhaseId = selectedItem?.workflow.phase?.id ?? null
  const currentStatusId = selectedItem?.workflow.status?.id ?? null
  const phaseOptions = workflowNodes
    .filter(node => node.kind.key === workflowMetadata.boardColumnKindKey)
    .sort(sortWorkflowNodes)
  const statusOptions = workflowNodes
    .filter(node => node.kind.key === workflowMetadata.primaryBadgeKindKey)
    .filter(node => currentPhaseId ? isWorkflowNodeDescendant(node, currentPhaseId, nodeById) : true)
    .sort(sortWorkflowNodes)
  const situationOptions = workflowNodes
    .filter(node => node.kind.key === workflowMetadata.secondaryBadgeKindKey)
    .filter(node => {
      if (currentStatusId) return isWorkflowNodeDescendant(node, currentStatusId, nodeById)
      if (currentPhaseId) return isWorkflowNodeDescendant(node, currentPhaseId, nodeById)
      return true
    })
    .sort(sortWorkflowNodes)

  const responsavelOptions = getResponsavelOptions(
    [
      ...(teamMembersQuery.data?.members ?? []).map(member => ({
        id: member.userId,
        name: member.name,
        email: member.email,
      })),
      ...(boardQuery.data?.filterOptions.responsaveis ?? []),
    ],
    selectedItem?.responsavel ?? null,
  )

  const moveToNode = async (targetNodeId: string) => {
    if (!selectedItem) return
    await moveMutation.mutateAsync({
      oportunidadeId: selectedItem.oportunidadeId,
      targetNodeId,
    })
  }

  const updateItem = async (patch: QuickUpdatePatch) => {
    if (!selectedItem) return
    await updateDetailMutation.mutateAsync({
      oportunidadeId: selectedItem.oportunidadeId,
      ...patch,
    })
  }

  const updateDetails = async (patch: Omit<UpdateOportunidadeDetailsPayload, "companyId" | "oportunidadeId">) => {
    await updateDetailsMutation.mutateAsync(patch)
  }

  return {
    selectedItem,
    workspaceModel,
    workflowNodes,
    workflowMetadata,
    phaseOptions,
    statusOptions,
    situationOptions,
    responsavelOptions,
    moveOptions: selectedItem ? getMoveOptions(selectedItem) : [],
    isLoading: workflowQuery.isLoading || boardQuery.isLoading || detailWorkspaceQuery.isLoading,
    errorMessage: selectedItem
      ? (detailWorkspaceQuery.error instanceof Error ? detailWorkspaceQuery.error.message : null)
      : "Não foi possível localizar essa oportunidade.",
    isMoving: moveMutation.isPending,
    isUpdating: updateDetailMutation.isPending,
    isUpdatingDetails: updateDetailsMutation.isPending,
    updateItem,
    updateDetails,
    moveToNode,
    documentChatService,
    documentSummaryService,
  }
}
