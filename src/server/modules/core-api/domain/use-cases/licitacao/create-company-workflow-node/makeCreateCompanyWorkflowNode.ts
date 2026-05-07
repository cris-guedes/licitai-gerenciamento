import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaWorkflowRepository } from "@/server/shared/infra/repositories/workflow.repository";
import { CreateCompanyWorkflowNode } from "./CreateCompanyWorkflowNode";
import { CreateCompanyWorkflowNodeController } from "./CreateCompanyWorkflowNodeController";

export function makeCreateCompanyWorkflowNode(): CreateCompanyWorkflowNodeController {
    const workflowRepository = new PrismaWorkflowRepository();
    const companyRepository = new PrismaCompanyRepository();
    const membershipRepository = new PrismaMembershipRepository();
    const useCase = new CreateCompanyWorkflowNode(workflowRepository, companyRepository, membershipRepository);

    return new CreateCompanyWorkflowNodeController(useCase);
}
