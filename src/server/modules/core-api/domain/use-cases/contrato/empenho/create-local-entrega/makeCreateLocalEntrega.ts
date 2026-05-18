import { PrismaEmpenhoRepository } from "@/server/shared/infra/repositories/empenho.repository";
import { CreateLocalEntrega } from "./CreateLocalEntrega";
import { CreateLocalEntregaController } from "./CreateLocalEntregaController";

export function makeCreateLocalEntrega(): CreateLocalEntregaController {
    const empenhoRepository = new PrismaEmpenhoRepository();
    const useCase = new CreateLocalEntrega(empenhoRepository);
    return new CreateLocalEntregaController(useCase);
}
