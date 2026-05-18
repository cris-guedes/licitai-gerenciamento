import { PrismaContratoRepository } from "@/server/shared/infra/repositories/contrato.repository";
import { ListContratosDTO } from "./dtos/ListContratosDTOs";
import { ListContratosMapper, ListContratosView } from "./dtos/ListContratosView";

export class ListContratos {
    constructor(private readonly contratoRepository: PrismaContratoRepository) { }

    async execute(params: ListContratos.Params): Promise<ListContratos.Response> {
        const contratos = await this.contratoRepository.listByCompanyId({
            companyId: params.companyId,
            oportunidadeId: params.oportunidadeId,
        });

        return ListContratosMapper.toView(contratos);
    }
}

export namespace ListContratos {
    export type Params = ListContratosDTO;
    export type Response = ListContratosView;
}
