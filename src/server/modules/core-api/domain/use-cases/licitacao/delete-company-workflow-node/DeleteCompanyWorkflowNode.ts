/* eslint-disable @typescript-eslint/no-namespace */
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaWorkflowRepository } from "@/server/shared/infra/repositories/workflow.repository";
import { assertUserCanManageCompanySettings } from "../../company/_shared/assertCompanyAccess";
import { WorkflowViewMapper } from "../_shared/workflowView";
import type { DeleteCompanyWorkflowNodeDTO } from "./dtos/DeleteCompanyWorkflowNodeDTOs";
import type { DeleteCompanyWorkflowNodeView } from "./dtos/DeleteCompanyWorkflowNodeView";

export class DeleteCompanyWorkflowNode {
    constructor(
        private readonly workflowRepository: PrismaWorkflowRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: DeleteCompanyWorkflowNode.Params): Promise<DeleteCompanyWorkflowNode.Response> {
        await assertUserCanManageCompanySettings({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        const workflow = await this.workflowRepository.deleteNode({
            companyId: params.companyId,
            workflowDefinitionId: params.workflowDefinitionId,
            nodeId: params.nodeId,
        });

        return {
            workflow: WorkflowViewMapper.toView(workflow),
        };
    }
}

export namespace DeleteCompanyWorkflowNode {
    export type Params = DeleteCompanyWorkflowNodeDTO;
    export type Response = DeleteCompanyWorkflowNodeView;
}
