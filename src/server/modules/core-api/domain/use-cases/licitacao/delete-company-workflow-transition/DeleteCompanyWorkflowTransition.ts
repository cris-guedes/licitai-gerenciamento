/* eslint-disable @typescript-eslint/no-namespace */
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaWorkflowRepository } from "@/server/shared/infra/repositories/workflow.repository";
import { assertUserCanManageCompanySettings } from "../../company/_shared/assertCompanyAccess";
import { WorkflowViewMapper } from "../_shared/workflowView";
import type { DeleteCompanyWorkflowTransitionDTO } from "./dtos/DeleteCompanyWorkflowTransitionDTOs";
import type { DeleteCompanyWorkflowTransitionView } from "./dtos/DeleteCompanyWorkflowTransitionView";

export class DeleteCompanyWorkflowTransition {
    constructor(
        private readonly workflowRepository: PrismaWorkflowRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: DeleteCompanyWorkflowTransition.Params): Promise<DeleteCompanyWorkflowTransition.Response> {
        await assertUserCanManageCompanySettings({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        const workflow = await this.workflowRepository.deleteTransition({
            companyId: params.companyId,
            workflowDefinitionId: params.workflowDefinitionId,
            transitionId: params.transitionId,
        });

        return {
            workflow: WorkflowViewMapper.toView(workflow),
        };
    }
}

export namespace DeleteCompanyWorkflowTransition {
    export type Params = DeleteCompanyWorkflowTransitionDTO;
    export type Response = DeleteCompanyWorkflowTransitionView;
}
