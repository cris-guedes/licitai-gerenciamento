import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { ListLicitacaoDrafts } from "./ListLicitacaoDrafts";
import { ListLicitacaoDraftsController } from "./ListLicitacaoDraftsController";

export function makeListLicitacaoDrafts() {
    const useCase = new ListLicitacaoDrafts(
        new PrismaOportunidadeRepository(),
        new PrismaCompanyRepository(),
        new PrismaMembershipRepository(),
    );

    return new ListLicitacaoDraftsController(useCase);
}
