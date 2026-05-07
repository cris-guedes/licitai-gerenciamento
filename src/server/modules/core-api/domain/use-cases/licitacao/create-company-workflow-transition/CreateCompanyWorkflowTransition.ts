/* eslint-disable @typescript-eslint/no-namespace */
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaWorkflowRepository } from "@/server/shared/infra/repositories/workflow.repository";
import { assertUserCanManageCompanySettings } from "../../company/_shared/assertCompanyAccess";
import { WorkflowViewMapper } from "../_shared/workflowView";
import type { CreateCompanyWorkflowTransitionDTO } from "./dtos/CreateCompanyWorkflowTransitionDTOs";
import type { CreateCompanyWorkflowTransitionView } from "./dtos/CreateCompanyWorkflowTransitionView";

export class CreateCompanyWorkflowTransition {
    constructor(
        private readonly workflowRepository: PrismaWorkflowRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: CreateCompanyWorkflowTransition.Params): Promise<CreateCompanyWorkflowTransition.Response> {
        await assertUserCanManageCompanySettings({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        const workflow = await this.workflowRepository.createTransition({
            companyId: params.companyId,
            workflowDefinitionId: params.workflowDefinitionId,
            fromNodeId: params.fromNodeId,
            toNodeId: params.toNodeId,
            transitionType: params.transitionType,
        });

        return {
            workflow: WorkflowViewMapper.toView(workflow),
        };
    }
}

export namespace CreateCompanyWorkflowTransition {
    export type Params = CreateCompanyWorkflowTransitionDTO;
    export type Response = CreateCompanyWorkflowTransitionView;
}
