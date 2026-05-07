export interface CreateCompanyWorkflowTransitionDTO {
    companyId: string;
    workflowDefinitionId: string;
    fromNodeId: string;
    toNodeId: string;
    transitionType?: string | null;
    userId: string;
}
