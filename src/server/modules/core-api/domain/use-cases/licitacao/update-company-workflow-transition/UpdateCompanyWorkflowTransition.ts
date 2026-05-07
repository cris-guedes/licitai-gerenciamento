/* eslint-disable @typescript-eslint/no-namespace */
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaWorkflowRepository } from "@/server/shared/infra/repositories/workflow.repository";
import { assertUserCanManageCompanySettings } from "../../company/_shared/assertCompanyAccess";
import { WorkflowViewMapper } from "../_shared/workflowView";
import type { UpdateCompanyWorkflowTransitionDTO } from "./dtos/UpdateCompanyWorkflowTransitionDTOs";
import type { UpdateCompanyWorkflowTransitionView } from "./dtos/UpdateCompanyWorkflowTransitionView";

export class UpdateCompanyWorkflowTransition {
    constructor(
        private readonly workflowRepository: PrismaWorkflowRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: UpdateCompanyWorkflowTransition.Params): Promise<UpdateCompanyWorkflowTransition.Response> {
        await assertUserCanManageCompanySettings({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        const workflow = await this.workflowRepository.updateTransition({
            companyId: params.companyId,
            workflowDefinitionId: params.workflowDefinitionId,
            transitionId: params.transitionId,
            transitionType: params.transitionType,
        });

        return {
            workflow: WorkflowViewMapper.toView(workflow),
        };
    }
}

export namespace UpdateCompanyWorkflowTransition {
    export type Params = UpdateCompanyWorkflowTransitionDTO;
    export type Response = UpdateCompanyWorkflowTransitionView;
}
