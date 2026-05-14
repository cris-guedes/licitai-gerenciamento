import { PrismaContratoRepository } from "@/server/shared/infra/repositories/contrato.repository";
import { GetContratoWorkspaceDTO } from "./dtos/GetContratoWorkspaceDTOs";
import { GetContratoWorkspaceMapper, GetContratoWorkspaceView } from "./dtos/GetContratoWorkspaceView";

export class GetContratoWorkspace {
    constructor(private readonly contratoRepository: PrismaContratoRepository) { }

    async execute(params: GetContratoWorkspace.Params): Promise<GetContratoWorkspace.Response> {
        const workspace = await this.contratoRepository.findWorkspaceById({
            id: params.contratoId,
            companyId: params.companyId,
        });

        if (!workspace) {
            const error = new Error("Contrato não encontrado");
            (error as any).statusCode = 404;
            throw error;
        }

        return GetContratoWorkspaceMapper.toView(workspace);
    }
}

export namespace GetContratoWorkspace {
    export type Params = GetContratoWorkspaceDTO;
    export type Response = GetContratoWorkspaceView;
}
