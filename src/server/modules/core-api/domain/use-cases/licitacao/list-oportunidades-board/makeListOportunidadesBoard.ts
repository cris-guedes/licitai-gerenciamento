import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { ListOportunidadesBoard } from "./ListOportunidadesBoard";
import { ListOportunidadesBoardController } from "./ListOportunidadesBoardController";

export function makeListOportunidadesBoard(): ListOportunidadesBoardController {
    const oportunidadeRepository = new PrismaOportunidadeRepository();
    const companyRepository = new PrismaCompanyRepository();
    const membershipRepository = new PrismaMembershipRepository();

    const useCase = new ListOportunidadesBoard(
        oportunidadeRepository,
        companyRepository,
        membershipRepository,
    );

    return new ListOportunidadesBoardController(useCase);
}
