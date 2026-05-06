export interface ListOportunidadesBoardDTO {
    companyId: string;
    userId: string;
    currentPhaseNodeId?: string;
    currentStatusNodeId?: string;
    currentSituationNodeId?: string;
    responsavelUserId?: string;
    q?: string;
}
