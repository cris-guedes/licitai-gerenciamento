import { PrismaEntregaRepository } from "@/server/shared/infra/repositories/entrega.repository";
import { UpdateEntregaStatus } from "./UpdateEntregaStatus";
import { UpdateEntregaStatusController } from "./UpdateEntregaStatusController";

export function makeUpdateEntregaStatus(): UpdateEntregaStatusController {
    const entregaRepository = new PrismaEntregaRepository();
    const useCase = new UpdateEntregaStatus(entregaRepository);
    return new UpdateEntregaStatusController(useCase);
}
