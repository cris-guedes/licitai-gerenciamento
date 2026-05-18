import { PrismaContratoRepository } from "@/server/shared/infra/repositories/contrato.repository";
import { PrismaOportunidadeRepository } from "@/server/shared/infra/repositories/oportunidade.repository";
import { CreateContrato } from "./CreateContrato";
import { CreateContratoController } from "./CreateContratoController";

export function makeCreateContrato(): CreateContratoController {
    const contratoRepository = new PrismaContratoRepository();
    const oportunidadeRepository = new PrismaOportunidadeRepository();
    
    const useCase = new CreateContrato(contratoRepository, oportunidadeRepository);
    return new CreateContratoController(useCase);
}
