export interface UpdateCompanyWorkflowTransitionDTO {
    companyId: string;
    workflowDefinitionId: string;
    transitionId: string;
    transitionType?: string | null;
    userId: string;
}
