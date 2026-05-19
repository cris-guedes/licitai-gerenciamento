/* eslint-disable @typescript-eslint/no-namespace */
import { PrismaContratoRepository } from "@/server/shared/infra/repositories/contrato.repository";
import type { DeleteContratoItemDTO } from "./dtos/DeleteContratoItemDTOs";

export class DeleteContratoItem {
    constructor(private readonly contratoRepository: PrismaContratoRepository) {}

    async execute(params: DeleteContratoItem.Params): Promise<DeleteContratoItem.Response> {
        const item = await this.contratoRepository.findItemById({
            companyId: params.companyId,
            contratoId: params.contratoId,
            contratoItemId: params.contratoItemId,
        });

        if (!item) {
            const error = new Error("Item do contrato não encontrado") as Error & { statusCode: number };
            error.statusCode = 404;
            throw error;
        }

        const quantidadeEmpenhada = Number(item.quantidadeEmpenhada ?? 0);
        const hasEmpenhos = quantidadeEmpenhada > 0 || (item._count?.empenhoItens ?? 0) > 0;

        if (hasEmpenhos) {
            const error = new Error("Não é possível remover item que já possui empenho vinculado") as Error & { statusCode: number };
            error.statusCode = 400;
            throw error;
        }

        await this.contratoRepository.deleteItem({
            contratoItemId: params.contratoItemId,
        });

        return {
            contratoItemId: params.contratoItemId,
        };
    }
}

export namespace DeleteContratoItem {
    export type Params = DeleteContratoItemDTO;
    export type Response = {
        contratoItemId: string;
    };
}
