/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */
import { PrismaEntregaRepository } from "@/server/shared/infra/repositories/entrega.repository";
import { CreateEntregaDTO } from "./dtos/CreateEntregaDTOs";
import { CreateEntregaMapper, type CreateEntregaView } from "./dtos/CreateEntregaView";

export class CreateEntrega {
    constructor(private readonly entregaRepository: PrismaEntregaRepository) { }

    async execute(params: CreateEntrega.Params): Promise<CreateEntrega.Response> {
        const itens = params.itens?.length
            ? params.itens
            : params.empenhoItemId && params.quantidade
                ? [{ empenhoItemId: params.empenhoItemId, quantidade: params.quantidade }]
                : [];

        if (itens.length === 0) {
            const error = new Error("Informe ao menos um item para criar a entrega") as Error & { statusCode: number };
            error.statusCode = 400;
            throw error;
        }

        let entregas;

        try {
            entregas = await this.entregaRepository.createMany({
                companyId: params.companyId,
                contratoId: params.contratoId,
                empenhoId: params.empenhoId,
                localEntregaId: params.localEntregaId,
                itens,
                dataPrevista: params.dataPrevista,
                observacoes: params.observacoes,
            });
        } catch (error: any) {
            if (
                error.message.includes("não pertence")
                || error.message.includes("não encontrado")
                || error.message.includes("Quantidade inválida")
                || error.message.includes("excede o saldo")
            ) {
                error.statusCode = 400;
            }

            throw error;
        }

        return CreateEntregaMapper.toView(entregas);
    }
}

export namespace CreateEntrega {
    export type Params = CreateEntregaDTO;
    export type Response = CreateEntregaView;
}
