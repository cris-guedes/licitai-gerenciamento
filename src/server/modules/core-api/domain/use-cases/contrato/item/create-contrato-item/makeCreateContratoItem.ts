import { PrismaContratoRepository } from "@/server/shared/infra/repositories/contrato.repository";
import { CreateContratoItem } from "./CreateContratoItem";
import { CreateContratoItemController } from "./CreateContratoItemController";

export function makeCreateContratoItem(): CreateContratoItemController {
    const repository = new PrismaContratoRepository();
    const useCase = new CreateContratoItem(repository);
    return new CreateContratoItemController(useCase);
}
