import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaWorkflowRepository } from "@/server/shared/infra/repositories/workflow.repository";
import { GetCompanyWorkflow } from "./GetCompanyWorkflow";
import { GetCompanyWorkflowController } from "./GetCompanyWorkflowController";

export function makeGetCompanyWorkflow(): GetCompanyWorkflowController {
    const workflowRepository = new PrismaWorkflowRepository();
    const companyRepository = new PrismaCompanyRepository();
    const membershipRepository = new PrismaMembershipRepository();

    const useCase = new GetCompanyWorkflow(
        workflowRepository,
        companyRepository,
        membershipRepository,
    );

    return new GetCompanyWorkflowController(useCase);
}
