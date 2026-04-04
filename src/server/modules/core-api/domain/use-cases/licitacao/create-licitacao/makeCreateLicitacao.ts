import { PrismaMembershipRepository } from "@/server/shared/infra/repositories/membership.repository";
import { CreateLicitacao } from "./CreateLicitacao";
import { CreateLicitacaoController } from "./CreateLicitacaoController";

export function makeCreateLicitacao(): CreateLicitacaoController {
    const useCase = new CreateLicitacao(
        new PrismaMembershipRepository(),
    );
    return new CreateLicitacaoController(useCase);
}
