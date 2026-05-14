import { PrismaContratoRepository } from "@/server/shared/infra/repositories/contrato.repository";
import { ListContratos } from "./ListContratos";
import { ListContratosController } from "./ListContratosController";

export function makeListContratos(): ListContratosController {
    const contratoRepository = new PrismaContratoRepository();
    const useCase = new ListContratos(contratoRepository);
    return new ListContratosController(useCase);
}
