export interface CreateCompanyWorkflowNodeDTO {
    companyId: string;
    workflowDefinitionId: string;
    parentNodeId?: string | null;
    kindId?: string | null;
    label: string;
    description?: string | null;
    color?: string | null;
    isInitial?: boolean;
    isTerminal?: boolean;
    position?: {
        x: number;
        y: number;
    } | null;
    userId: string;
}
