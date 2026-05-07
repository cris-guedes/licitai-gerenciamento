/* eslint-disable @typescript-eslint/no-namespace */
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaWorkflowRepository } from "@/server/shared/infra/repositories/workflow.repository";
import { assertUserCanManageCompanySettings } from "../../company/_shared/assertCompanyAccess";
import { WorkflowViewMapper } from "../_shared/workflowView";
import type { CreateCompanyWorkflowNodeDTO } from "./dtos/CreateCompanyWorkflowNodeDTOs";
import type { CreateCompanyWorkflowNodeView } from "./dtos/CreateCompanyWorkflowNodeView";

export class CreateCompanyWorkflowNode {
    constructor(
        private readonly workflowRepository: PrismaWorkflowRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: CreateCompanyWorkflowNode.Params): Promise<CreateCompanyWorkflowNode.Response> {
        await assertUserCanManageCompanySettings({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        const workflow = await this.workflowRepository.createNode({
            companyId: params.companyId,
            workflowDefinitionId: params.workflowDefinitionId,
            parentNodeId: params.parentNodeId,
            kindId: params.kindId,
            label: params.label.trim(),
            description: params.description,
            color: params.color,
            isInitial: params.isInitial,
            isTerminal: params.isTerminal,
            position: params.position,
        });

        return {
            workflow: WorkflowViewMapper.toView(workflow),
        };
    }
}

export namespace CreateCompanyWorkflowNode {
    export type Params = CreateCompanyWorkflowNodeDTO;
    export type Response = CreateCompanyWorkflowNodeView;
}
