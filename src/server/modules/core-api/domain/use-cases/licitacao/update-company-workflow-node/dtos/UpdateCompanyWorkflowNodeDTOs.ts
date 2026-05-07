export interface UpdateCompanyWorkflowNodeDTO {
    companyId: string;
    workflowDefinitionId: string;
    nodeId: string;
    label?: string;
    description?: string | null;
    color?: string | null;
    isInitial?: boolean;
    isTerminal?: boolean;
    order?: number;
    position?: {
        x: number;
        y: number;
    } | null;
    userId: string;
}
