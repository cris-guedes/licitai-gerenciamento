import { PrismaContratoRepository } from "@/server/shared/infra/repositories/contrato.repository";
import { GetContratoWorkspace } from "./GetContratoWorkspace";
import { GetContratoWorkspaceController } from "./GetContratoWorkspaceController";

export function makeGetContratoWorkspace(): GetContratoWorkspaceController {
    const contratoRepository = new PrismaContratoRepository();
    const useCase = new GetContratoWorkspace(contratoRepository);
    return new GetContratoWorkspaceController(useCase);
}
