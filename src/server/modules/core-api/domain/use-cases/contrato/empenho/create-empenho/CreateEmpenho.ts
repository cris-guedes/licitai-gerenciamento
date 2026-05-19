/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */
import { PrismaEmpenhoRepository } from "@/server/shared/infra/repositories/empenho.repository";
import { PrismaContratoRepository } from "@/server/shared/infra/repositories/contrato.repository";
import { CreateEmpenhoDTO } from "./dtos/CreateEmpenhoDTOs";
import { CreateEmpenhoMapper, CreateEmpenhoView } from "./dtos/CreateEmpenhoView";


export class CreateEmpenho {
    constructor(
        private readonly empenhoRepository: PrismaEmpenhoRepository,
        private readonly contratoRepository: PrismaContratoRepository,
    ) { }

    async execute(params: CreateEmpenho.Params): Promise<CreateEmpenho.Response> {
        // Valida se o contrato existe e pertence à empresa
        const contrato = await this.contratoRepository.findById({
            id: params.contratoId,
            companyId: params.companyId,
        });

        if (!contrato) {
            const error = new Error("Contrato não encontrado");
            (error as any).statusCode = 404;
            throw error;
        }

        // Criar o empenho através do repositório (que cuida da validação do saldo na transaction)
        try {
            const empenho = await this.empenhoRepository.createWithItems({
                contratoId: params.contratoId,
                numeroEmpenho: params.numeroEmpenho,
                tipoEmpenho: params.tipoEmpenho,
                valor: params.valor,
                dataEmissao: params.dataEmissao,
                orgaoCnpj: params.orgaoCnpj,
                orgaoNome: params.orgaoNome,
                orgaoUnidadeNome: params.orgaoUnidadeNome,
                observacao: params.observacao,
                status: params.status as any,
                itens: params.itens,
            });

            return CreateEmpenhoMapper.toView(empenho);
        } catch (error: any) {
            // Se o repositório lançou um erro de validação de saldo, o controller vai retornar 500 ou 400
            // Idealmente mapearíamos para BadRequest (400) se for problema de saldo.
            if (
                error.message.includes("saldo do contrato")
                || error.message.includes("Informe ao menos um item")
                || error.message.includes("Quantidade inválida")
                || error.message.includes("Item de contrato não encontrado")
            ) {
                error.statusCode = 400;
            }
            throw error;
        }
    }
}

export namespace CreateEmpenho {
    export type Params = CreateEmpenhoDTO;
    export type Response = CreateEmpenhoView;
}
