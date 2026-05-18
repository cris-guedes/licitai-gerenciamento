import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { DeleteOportunidadeTask } from "./DeleteOportunidadeTask";
import { DeleteOportunidadeTaskController } from "./DeleteOportunidadeTaskController";

export function makeDeleteOportunidadeTask(): DeleteOportunidadeTaskController {
    const oportunidadeRepository = new PrismaOportunidadeRepository();
    const companyRepository = new PrismaCompanyRepository();
    const membershipRepository = new PrismaMembershipRepository();

    const useCase = new DeleteOportunidadeTask(
        oportunidadeRepository,
        companyRepository,
        membershipRepository,
    );

    return new DeleteOportunidadeTaskController(useCase);
}
