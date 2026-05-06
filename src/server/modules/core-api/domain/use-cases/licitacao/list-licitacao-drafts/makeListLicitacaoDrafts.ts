import { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";
import { PrismaLicitacaoRepository } from "@/server/shared/infra/repositories/licitacao.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { ListLicitacaoDrafts } from "./ListLicitacaoDrafts";
import { ListLicitacaoDraftsController } from "./ListLicitacaoDraftsController";

export function makeListLicitacaoDrafts() {
    const useCase = new ListLicitacaoDrafts(
        new PrismaLicitacaoRepository(),
        new PrismaCompanyRepository(),
        new PrismaMembershipRepository(),
    );

    return new ListLicitacaoDraftsController(useCase);
}
