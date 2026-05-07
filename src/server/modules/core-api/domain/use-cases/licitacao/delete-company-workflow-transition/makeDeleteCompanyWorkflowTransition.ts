import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaWorkflowRepository } from "@/server/shared/infra/repositories/workflow.repository";
import { DeleteCompanyWorkflowTransition } from "./DeleteCompanyWorkflowTransition";
import { DeleteCompanyWorkflowTransitionController } from "./DeleteCompanyWorkflowTransitionController";

export function makeDeleteCompanyWorkflowTransition(): DeleteCompanyWorkflowTransitionController {
    const workflowRepository = new PrismaWorkflowRepository();
    const companyRepository = new PrismaCompanyRepository();
    const membershipRepository = new PrismaMembershipRepository();
    const useCase = new DeleteCompanyWorkflowTransition(workflowRepository, companyRepository, membershipRepository);

    return new DeleteCompanyWorkflowTransitionController(useCase);
}
