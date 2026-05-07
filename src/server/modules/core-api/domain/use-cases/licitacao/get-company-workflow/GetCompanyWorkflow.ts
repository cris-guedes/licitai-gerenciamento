/* eslint-disable @typescript-eslint/no-namespace */
import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaWorkflowRepository } from "@/server/shared/infra/repositories/workflow.repository";
import { assertUserCanAccessCompany } from "../../company/_shared/assertCompanyAccess";
import { WorkflowViewMapper } from "../_shared/workflowView";
import type { GetCompanyWorkflowDTO } from "./dtos/GetCompanyWorkflowDTOs";
import type { GetCompanyWorkflowView } from "./dtos/GetCompanyWorkflowView";

export class GetCompanyWorkflow {
    constructor(
        private readonly workflowRepository: PrismaWorkflowRepository,
        private readonly companyRepository: PrismaCompanyRepository,
        private readonly membershipRepository: PrismaMembershipRepository,
    ) {}

    async execute(params: GetCompanyWorkflow.Params): Promise<GetCompanyWorkflow.Response> {
        await assertUserCanAccessCompany({
            companyRepository: this.companyRepository,
            membershipRepository: this.membershipRepository,
            userId: params.userId,
            companyId: params.companyId,
        });

        await this.workflowRepository.ensureDefaultWorkflowForCompany({
            companyId: params.companyId,
        });

        const workflow = await this.workflowRepository.findActiveDefinitionByCompanyId({
            companyId: params.companyId,
        });

        if (!workflow) {
            throw new Error("Workflow da empresa não encontrado.");
        }

        return {
            workflow: WorkflowViewMapper.toView(workflow),
        };
    }
}

export namespace GetCompanyWorkflow {
    export type Params = GetCompanyWorkflowDTO;
    export type Response = GetCompanyWorkflowView;
}
