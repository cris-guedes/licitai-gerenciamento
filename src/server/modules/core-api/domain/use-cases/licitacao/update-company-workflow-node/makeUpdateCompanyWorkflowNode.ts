import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaWorkflowRepository } from "@/server/shared/infra/repositories/workflow.repository";
import { UpdateCompanyWorkflowNode } from "./UpdateCompanyWorkflowNode";
import { UpdateCompanyWorkflowNodeController } from "./UpdateCompanyWorkflowNodeController";

export function makeUpdateCompanyWorkflowNode(): UpdateCompanyWorkflowNodeController {
    const workflowRepository = new PrismaWorkflowRepository();
    const companyRepository = new PrismaCompanyRepository();
    const membershipRepository = new PrismaMembershipRepository();

    return new UpdateCompanyWorkflowNodeController(
        new UpdateCompanyWorkflowNode(
            workflowRepository,
            companyRepository,
            membershipRepository,
        ),
    );
}
