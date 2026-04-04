import { PrismaEditalRepository } from "@/server/shared/infra/repositories/edital.repository";
import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { ListLicitacoes } from "./ListLicitacoes";
import { ListLicitacoesController } from "./ListLicitacoesController";

export function makeListLicitacoes(): ListLicitacoesController {
    const useCase = new ListLicitacoes(
        new PrismaEditalRepository(),
        new PrismaMembershipRepository(),
    );
    return new ListLicitacoesController(useCase);
}
