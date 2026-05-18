import { PrismaEntregaRepository } from "@/server/shared/infra/repositories/entrega.repository";
import { UpdateEntregaStatusDTO } from "./dtos/UpdateEntregaStatusDTOs";

export class UpdateEntregaStatus {
    constructor(private readonly entregaRepository: PrismaEntregaRepository) { }

    async execute(params: UpdateEntregaStatus.Params): Promise<UpdateEntregaStatus.Response> {
        const entrega = await this.entregaRepository.updateStatus(params.entregaId, {
            status: params.status,
            dataEntrega: params.dataEntrega,
            observacoes: params.observacoes,
        });

        return entrega;
    }
}

export namespace UpdateEntregaStatus {
    export type Params = UpdateEntregaStatusDTO;
    export type Response = any;
}
