import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { DeleteOportunidadeItem } from "./DeleteOportunidadeItem";
import { DeleteOportunidadeItemController } from "./DeleteOportunidadeItemController";

export function makeDeleteOportunidadeItem(): DeleteOportunidadeItemController {
    const repository = new PrismaOportunidadeRepository();
    const useCase = new DeleteOportunidadeItem(repository);
    const controller = new DeleteOportunidadeItemController(useCase);

    return controller;
}
