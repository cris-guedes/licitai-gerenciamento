import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaWorkflowRepository } from "@/server/shared/infra/repositories/workflow.repository";
import { UpdateCompanyWorkflowTransition } from "./UpdateCompanyWorkflowTransition";
import { UpdateCompanyWorkflowTransitionController } from "./UpdateCompanyWorkflowTransitionController";

export function makeUpdateCompanyWorkflowTransition(): UpdateCompanyWorkflowTransitionController {
    const workflowRepository = new PrismaWorkflowRepository();
    const companyRepository = new PrismaCompanyRepository();
    const membershipRepository = new PrismaMembershipRepository();
    const useCase = new UpdateCompanyWorkflowTransition(workflowRepository, companyRepository, membershipRepository);

    return new UpdateCompanyWorkflowTransitionController(useCase);
}
