import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaWorkflowRepository } from "@/server/shared/infra/repositories/workflow.repository";
import { DeleteCompanyWorkflowNode } from "./DeleteCompanyWorkflowNode";
import { DeleteCompanyWorkflowNodeController } from "./DeleteCompanyWorkflowNodeController";

export function makeDeleteCompanyWorkflowNode(): DeleteCompanyWorkflowNodeController {
    const workflowRepository = new PrismaWorkflowRepository();
    const companyRepository = new PrismaCompanyRepository();
    const membershipRepository = new PrismaMembershipRepository();
    const useCase = new DeleteCompanyWorkflowNode(workflowRepository, companyRepository, membershipRepository);

    return new DeleteCompanyWorkflowNodeController(useCase);
}
