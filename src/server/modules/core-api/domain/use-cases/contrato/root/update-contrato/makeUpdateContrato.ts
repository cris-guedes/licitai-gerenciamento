import { PrismaContratoRepository } from "@/server/shared/infra/repositories/contrato.repository";
import { UpdateContrato } from "./UpdateContrato";
import { UpdateContratoController } from "./UpdateContratoController";

export function makeUpdateContrato(): UpdateContratoController {
    const contratoRepository = new PrismaContratoRepository();
    const useCase = new UpdateContrato(contratoRepository);

    return new UpdateContratoController(useCase);
}
