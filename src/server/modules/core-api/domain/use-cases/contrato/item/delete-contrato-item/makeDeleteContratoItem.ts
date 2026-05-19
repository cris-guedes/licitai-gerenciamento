import { PrismaContratoRepository } from "@/server/shared/infra/repositories/contrato.repository";
import { DeleteContratoItem } from "./DeleteContratoItem";
import { DeleteContratoItemController } from "./DeleteContratoItemController";

export function makeDeleteContratoItem(): DeleteContratoItemController {
    const repository = new PrismaContratoRepository();
    const useCase = new DeleteContratoItem(repository);
    return new DeleteContratoItemController(useCase);
}
