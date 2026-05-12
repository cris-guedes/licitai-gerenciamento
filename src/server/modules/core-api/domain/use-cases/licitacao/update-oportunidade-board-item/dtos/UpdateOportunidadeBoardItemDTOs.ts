export interface UpdateOportunidadeBoardItemDTO {
    companyId: string;
    oportunidadeId: string;
    responsavelUserId?: string | null;
    phaseNodeId?: string;
    statusNodeId?: string;
    situationNodeId?: string;
    userId: string;
}
