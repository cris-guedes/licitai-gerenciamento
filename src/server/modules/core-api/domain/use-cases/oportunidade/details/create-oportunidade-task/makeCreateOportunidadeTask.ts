import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { CreateOportunidadeTask } from "./CreateOportunidadeTask";
import { CreateOportunidadeTaskController } from "./CreateOportunidadeTaskController";

export function makeCreateOportunidadeTask(): CreateOportunidadeTaskController {
    const oportunidadeRepository = new PrismaOportunidadeRepository();
    const companyRepository = new PrismaCompanyRepository();
    const membershipRepository = new PrismaMembershipRepository();

    const useCase = new CreateOportunidadeTask(
        oportunidadeRepository,
        companyRepository,
        membershipRepository,
    );

    return new CreateOportunidadeTaskController(useCase);
}
