import { PrismaEntregaRepository } from "@/server/shared/infra/repositories/entrega.repository";
import { CreateEntrega } from "./CreateEntrega";
import { CreateEntregaController } from "./CreateEntregaController";

export function makeCreateEntrega(): CreateEntregaController {
    const entregaRepository = new PrismaEntregaRepository();
    const useCase = new CreateEntrega(entregaRepository);
    return new CreateEntregaController(useCase);
}
