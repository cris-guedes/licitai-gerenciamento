export interface ListOportunidadesBoardDTO {
    companyId: string;
    userId: string;
    workflowNodeIds?: string[];
    currentPhaseNodeId?: string;
    currentStatusNodeId?: string;
    currentSituationNodeId?: string;
    responsavelUserId?: string;
    valorEstimadoMin?: number;
    valorEstimadoMax?: number;
    q?: string;
}
