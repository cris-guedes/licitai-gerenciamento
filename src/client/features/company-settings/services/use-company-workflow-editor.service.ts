"use client"

import { useCallback } from "react"
import type { CoreApiClient } from "@/client/main/infra/apis/api-core"
import type { CompanyWorkflowResponse, WorkflowNodePosition } from "../types/workflow"

type WorkflowMutationResponse = CompanyWorkflowResponse

export function useCompanyWorkflowEditorService(api: CoreApiClient) {
  const getCompanyWorkflow = useCallback(async ({
    companyId,
  }: {
    companyId: string
  }): Promise<CompanyWorkflowResponse> => {
    return await api.oportunidade.getCompanyWorkflow({ companyId }) as CompanyWorkflowResponse
  }, [api])

  const createNode = useCallback(async ({
    companyId,
    workflowDefinitionId,
    parentNodeId,
    kindId,
    label,
    description,
    color,
    isInitial,
    isTerminal,
    position,
  }: {
    companyId: string
    workflowDefinitionId: string
    parentNodeId?: string | null
    kindId?: string | null
    label: string
    description?: string | null
    color?: string | null
    isInitial?: boolean
    isTerminal?: boolean
    position?: WorkflowNodePosition | null
  }): Promise<WorkflowMutationResponse> => {
    return await api.oportunidade.createCompanyWorkflowNode({
      requestBody: {
        companyId,
        workflowDefinitionId,
        parentNodeId,
        kindId,
        label,
        description,
        color,
        isInitial,
        isTerminal,
        position,
      },
    }) as WorkflowMutationResponse
  }, [api])

  const updateNode = useCallback(async ({
    companyId,
    workflowDefinitionId,
    nodeId,
    label,
    description,
    color,
    isInitial,
    isTerminal,
    order,
    position,
  }: {
    companyId: string
    workflowDefinitionId: string
    nodeId: string
    label?: string
    description?: string | null
    color?: string | null
    isInitial?: boolean
    isTerminal?: boolean
    order?: number
    position?: WorkflowNodePosition | null
  }): Promise<WorkflowMutationResponse> => {
    return await api.oportunidade.updateCompanyWorkflowNode({
      requestBody: {
        companyId,
        workflowDefinitionId,
        nodeId,
        label,
        description,
        color,
        isInitial,
        isTerminal,
        order,
        position,
      },
    }) as WorkflowMutationResponse
  }, [api])

  const deleteNode = useCallback(async ({
    companyId,
    workflowDefinitionId,
    nodeId,
  }: {
    companyId: string
    workflowDefinitionId: string
    nodeId: string
  }): Promise<WorkflowMutationResponse> => {
    return await api.oportunidade.deleteCompanyWorkflowNode({
      requestBody: {
        companyId,
        workflowDefinitionId,
        nodeId,
      },
    }) as WorkflowMutationResponse
  }, [api])

  const createTransition = useCallback(async ({
    companyId,
    workflowDefinitionId,
    fromNodeId,
    toNodeId,
    transitionType,
  }: {
    companyId: string
    workflowDefinitionId: string
    fromNodeId: string
    toNodeId: string
    transitionType?: string | null
  }): Promise<WorkflowMutationResponse> => {
    return await api.oportunidade.createCompanyWorkflowTransition({
      requestBody: {
        companyId,
        workflowDefinitionId,
        fromNodeId,
        toNodeId,
        transitionType,
      },
    }) as WorkflowMutationResponse
  }, [api])

  const updateTransition = useCallback(async ({
    companyId,
    workflowDefinitionId,
    transitionId,
    transitionType,
  }: {
    companyId: string
    workflowDefinitionId: string
    transitionId: string
    transitionType?: string | null
  }): Promise<WorkflowMutationResponse> => {
    return await api.oportunidade.updateCompanyWorkflowTransition({
      requestBody: {
        companyId,
        workflowDefinitionId,
        transitionId,
        transitionType,
      },
    }) as WorkflowMutationResponse
  }, [api])

  const deleteTransition = useCallback(async ({
    companyId,
    workflowDefinitionId,
    transitionId,
  }: {
    companyId: string
    workflowDefinitionId: string
    transitionId: string
  }): Promise<WorkflowMutationResponse> => {
    return await api.oportunidade.deleteCompanyWorkflowTransition({
      requestBody: {
        companyId,
        workflowDefinitionId,
        transitionId,
      },
    }) as WorkflowMutationResponse
  }, [api])

  return {
    getCompanyWorkflow,
    createNode,
    updateNode,
    deleteNode,
    createTransition,
    updateTransition,
    deleteTransition,
  }
}
