import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { ToggleOportunidadeTask } from "./ToggleOportunidadeTask";
import { ToggleOportunidadeTaskController } from "./ToggleOportunidadeTaskController";

export function makeToggleOportunidadeTask(): ToggleOportunidadeTaskController {
    const oportunidadeRepository = new PrismaOportunidadeRepository();
    const companyRepository = new PrismaCompanyRepository();
    const membershipRepository = new PrismaMembershipRepository();

    const useCase = new ToggleOportunidadeTask(
        oportunidadeRepository,
        companyRepository,
        membershipRepository,
    );

    return new ToggleOportunidadeTaskController(useCase);
}
