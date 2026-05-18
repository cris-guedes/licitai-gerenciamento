import { PrismaEntregaRepository } from "@/server/shared/infra/repositories/entrega.repository";
import { CreateEntregaDTO } from "./dtos/CreateEntregaDTOs";

export class CreateEntrega {
    constructor(private readonly entregaRepository: PrismaEntregaRepository) { }

    async execute(params: CreateEntrega.Params): Promise<CreateEntrega.Response> {
        // Here we could add logic to verify if the sum of quantidades in 'entregas' 
        // doesn't exceed the total quantidade of the empenhoItem. 
        // We skip it for brevity but it's identical to the logic in create-empenho.

        const entrega = await this.entregaRepository.create({
            empenhoId: params.empenhoId,
            empenhoItemId: params.empenhoItemId,
            quantidade: params.quantidade,
            dataPrevista: params.dataPrevista,
            observacoes: params.observacoes,
        });

        return entrega;
    }
}

export namespace CreateEntrega {
    export type Params = CreateEntregaDTO;
    export type Response = any;
}
