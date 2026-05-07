/* eslint-disable @typescript-eslint/no-namespace */
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaWorkflowRepository } from "@/server/shared/infra/repositories/workflow.repository";
import { assertUserCanManageCompanySettings } from "../../company/_shared/assertCompanyAccess";
import { WorkflowViewMapper } from "../_shared/workflowView";
import type { UpdateCompanyWorkflowNodeDTO } from "./dtos/UpdateCompanyWorkflowNodeDTOs";
import type { UpdateCompanyWorkflowNodeView } from "./dtos/UpdateCompanyWorkflowNodeView";

export class UpdateCompanyWorkflowNode {
    constructor(
        private readonly workflowRepository: PrismaWorkflowRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: UpdateCompanyWorkflowNode.Params): Promise<UpdateCompanyWorkflowNode.Response> {
        await assertUserCanManageCompanySettings({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        const workflow = await this.workflowRepository.updateNodePresentation({
            companyId: params.companyId,
            workflowDefinitionId: params.workflowDefinitionId,
            nodeId: params.nodeId,
            label: params.label,
            description: params.description,
            color: params.color,
            isInitial: params.isInitial,
            isTerminal: params.isTerminal,
            order: params.order,
            position: params.position,
        });

        return {
            workflow: WorkflowViewMapper.toView(workflow),
        };
    }
}

export namespace UpdateCompanyWorkflowNode {
    export type Params = UpdateCompanyWorkflowNodeDTO;
    export type Response = UpdateCompanyWorkflowNodeView;
}
