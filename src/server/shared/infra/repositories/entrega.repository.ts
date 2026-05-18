import { EmpenhoEntregaStatus } from "@prisma/client";
import { prisma } from "../db/client";

export class PrismaEntregaRepository {
    async create(params: {
        empenhoId: string;
        empenhoItemId: string;
        quantidade: number;
        dataPrevista?: Date | null;
        observacoes?: string | null;
    }): Promise<any> {
        return prisma.empenhoEntrega.create({
            data: {
                empenhoItemId: params.empenhoItemId,
                quantidadeEntregue: params.quantidade,
                descricao: params.dataPrevista
                    ? `Previsao de entrega: ${params.dataPrevista.toISOString().slice(0, 10)}`
                    : undefined,
                observacao: params.observacoes,
            }
        });
    }

    async updateStatus(id: string, params: {
        status: EmpenhoEntregaStatus;
        dataEntrega?: Date | null;
        observacoes?: string | null;
    }): Promise<any> {
        return prisma.empenhoEntrega.update({
            where: { id },
            data: {
                status: params.status,
                dataEntrega: params.dataEntrega !== undefined ? params.dataEntrega : undefined,
                observacao: params.observacoes !== undefined ? params.observacoes : undefined,
            }
        });
    }

    async findById(id: string): Promise<any | null> {
        return prisma.empenhoEntrega.findUnique({
            where: { id }
        });
    }
}
