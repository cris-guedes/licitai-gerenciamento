import { PrismaEmpenhoRepository } from "@/server/shared/infra/repositories/empenho.repository";
import { PrismaContratoRepository } from "@/server/shared/infra/repositories/contrato.repository";
import { CreateEmpenho } from "./CreateEmpenho";
import { CreateEmpenhoController } from "./CreateEmpenhoController";

export function makeCreateEmpenho(): CreateEmpenhoController {
    const empenhoRepository = new PrismaEmpenhoRepository();
    const contratoRepository = new PrismaContratoRepository();
    
    const useCase = new CreateEmpenho(empenhoRepository, contratoRepository);
    return new CreateEmpenhoController(useCase);
}
