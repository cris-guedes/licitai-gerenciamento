import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { PrismaWorkflowRepository } from "@/server/shared/infra/repositories/workflow.repository";
import { UpdateOportunidadeBoardItem } from "./UpdateOportunidadeBoardItem";
import { UpdateOportunidadeBoardItemController } from "./UpdateOportunidadeBoardItemController";

export function makeUpdateOportunidadeBoardItem(): UpdateOportunidadeBoardItemController {
    const oportunidadeRepository = new PrismaOportunidadeRepository();
    const workflowRepository = new PrismaWorkflowRepository();
    const companyRepository = new PrismaCompanyRepository();
    const membershipRepository = new PrismaMembershipRepository();

    const useCase = new UpdateOportunidadeBoardItem(
        oportunidadeRepository,
        workflowRepository,
        companyRepository,
        membershipRepository,
    );

    return new UpdateOportunidadeBoardItemController(useCase);
}
