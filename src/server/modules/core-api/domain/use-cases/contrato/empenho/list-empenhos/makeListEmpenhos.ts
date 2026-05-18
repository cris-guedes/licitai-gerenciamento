import { PrismaEmpenhoRepository } from "@/server/shared/infra/repositories/empenho.repository";
import { PrismaContratoRepository } from "@/server/shared/infra/repositories/contrato.repository";
import { ListEmpenhos } from "./ListEmpenhos";
import { ListEmpenhosController } from "./ListEmpenhosController";

export function makeListEmpenhos(): ListEmpenhosController {
    const empenhoRepository = new PrismaEmpenhoRepository();
    const contratoRepository = new PrismaContratoRepository();
    
    const useCase = new ListEmpenhos(empenhoRepository, contratoRepository);
    return new ListEmpenhosController(useCase);
}
