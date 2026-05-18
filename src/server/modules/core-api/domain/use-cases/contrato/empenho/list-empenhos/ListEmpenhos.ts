import { PrismaEmpenhoRepository } from "@/server/shared/infra/repositories/empenho.repository";
import { PrismaContratoRepository } from "@/server/shared/infra/repositories/contrato.repository";
import { ListEmpenhosDTO } from "./dtos/ListEmpenhosDTOs";
import { ListEmpenhosMapper, ListEmpenhosView } from "./dtos/ListEmpenhosView";

export class ListEmpenhos {
    constructor(
        private readonly empenhoRepository: PrismaEmpenhoRepository,
        private readonly contratoRepository: PrismaContratoRepository,
    ) { }

    async execute(params: ListEmpenhos.Params): Promise<ListEmpenhos.Response> {
        // Garantir que o contrato existe e pertence a empresa
        const contrato = await this.contratoRepository.findById({
            id: params.contratoId,
            companyId: params.companyId,
        });

        if (!contrato) {
            const error = new Error("Contrato não encontrado");
            (error as any).statusCode = 404;
            throw error;
        }

        const empenhos = await this.empenhoRepository.listByContratoId(params.contratoId);

        return ListEmpenhosMapper.toView(empenhos);
    }
}

export namespace ListEmpenhos {
    export type Params = ListEmpenhosDTO;
    export type Response = ListEmpenhosView;
}
