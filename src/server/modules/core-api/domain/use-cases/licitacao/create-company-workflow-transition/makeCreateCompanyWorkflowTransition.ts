import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaWorkflowRepository } from "@/server/shared/infra/repositories/workflow.repository";
import { CreateCompanyWorkflowTransition } from "./CreateCompanyWorkflowTransition";
import { CreateCompanyWorkflowTransitionController } from "./CreateCompanyWorkflowTransitionController";

export function makeCreateCompanyWorkflowTransition(): CreateCompanyWorkflowTransitionController {
    const workflowRepository = new PrismaWorkflowRepository();
    const companyRepository = new PrismaCompanyRepository();
    const membershipRepository = new PrismaMembershipRepository();
    const useCase = new CreateCompanyWorkflowTransition(workflowRepository, companyRepository, membershipRepository);

    return new CreateCompanyWorkflowTransitionController(useCase);
}
