import { PrismaContratoRepository } from "@/server/shared/infra/repositories/contrato.repository";
import { UpdateContratoItem } from "./UpdateContratoItem";
import { UpdateContratoItemController } from "./UpdateContratoItemController";

export function makeUpdateContratoItem(): UpdateContratoItemController {
    const repository = new PrismaContratoRepository();
    const useCase = new UpdateContratoItem(repository);
    return new UpdateContratoItemController(useCase);
}
