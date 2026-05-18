import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { CreateOportunidadeItem } from "./CreateOportunidadeItem";
import { CreateOportunidadeItemController } from "./CreateOportunidadeItemController";

export function makeCreateOportunidadeItem(): CreateOportunidadeItemController {
    const repository = new PrismaOportunidadeRepository();
    const useCase = new CreateOportunidadeItem(repository);
    const controller = new CreateOportunidadeItemController(useCase);

    return controller;
}
