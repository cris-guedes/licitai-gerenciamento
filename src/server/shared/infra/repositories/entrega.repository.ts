/* eslint-disable @typescript-eslint/no-explicit-any */
import { EmpenhoEntregaStatus } from "@prisma/client";
import { prisma } from "../db/client";

export class PrismaEntregaRepository {
    async create(params: {
        companyId?: string;
        contratoId?: string;
        empenhoId: string;
        empenhoItemId: string;
        quantidade: number;
        localEntregaId?: string | null;
        dataPrevista?: Date | null;
        observacoes?: string | null;
    }): Promise<any> {
        const [entrega] = await this.createMany({
            companyId: params.companyId ?? "",
            contratoId: params.contratoId ?? "",
            empenhoId: params.empenhoId,
            localEntregaId: params.localEntregaId,
            itens: [{
                empenhoItemId: params.empenhoItemId,
                quantidade: params.quantidade,
            }],
            dataPrevista: params.dataPrevista,
            observacoes: params.observacoes,
        });

        return entrega;
    }

    async createMany(params: {
        companyId: string;
        contratoId: string;
        empenhoId: string;
        itens: Array<{
            empenhoItemId: string;
            quantidade: number;
        }>;
        localEntregaId?: string | null;
        dataPrevista?: Date | null;
        observacoes?: string | null;
    }): Promise<any[]> {
        return prisma.$transaction(async (tx) => {
            if (params.localEntregaId) {
                const local = await tx.empenhoLocalEntrega.findFirst({
                    where: {
                        id: params.localEntregaId,
                        empenhoId: params.empenhoId,
                    },
                    select: {
                        id: true,
                    },
                });

                if (!local) {
                    throw new Error("Local de entrega não pertence a este empenho");
                }
            }

            const entregas = [];

            for (const item of params.itens) {
                const empenhoItem = await tx.empenhoItem.findFirst({
                    where: {
                        id: item.empenhoItemId,
                        empenhoId: params.empenhoId,
                        empenho: {
                            contratoId: params.contratoId,
                            contrato: {
                                companyId: params.companyId,
                            },
                        },
                    },
                    select: {
                        id: true,
                        contratoItemId: true,
                        quantidade: true,
                        quantidadeEntregue: true,
                    },
                });

                if (!empenhoItem) {
                    throw new Error(`Item de empenho não encontrado: ${item.empenhoItemId}`);
                }

                if (item.quantidade <= 0) {
                    throw new Error(`Quantidade inválida para o item ${item.empenhoItemId}`);
                }

                const entregasAgendadas = await tx.empenhoEntrega.aggregate({
                    where: {
                        empenhoItemId: item.empenhoItemId,
                        status: {
                            not: "REJEITADO",
                        },
                    },
                    _sum: {
                        quantidadeEntregue: true,
                    },
                });
                const quantidadeEmpenhada = Number(empenhoItem.quantidade);
                const quantidadeJaReservada = Math.max(
                    Number(empenhoItem.quantidadeEntregue),
                    Number(entregasAgendadas._sum.quantidadeEntregue ?? 0),
                );
                const proximaQuantidade = quantidadeJaReservada + Number(item.quantidade);

                if (proximaQuantidade > quantidadeEmpenhada) {
                    throw new Error(`Quantidade a entregar excede o saldo do empenho para o item ${item.empenhoItemId}`);
                }

                const entrega = await tx.empenhoEntrega.create({
                    data: {
                        empenhoItemId: item.empenhoItemId,
                        localEntregaId: params.localEntregaId || undefined,
                        quantidadeEntregue: item.quantidade,
                        descricao: params.dataPrevista
                            ? `Previsao de entrega: ${params.dataPrevista.toISOString().slice(0, 10)}`
                            : undefined,
                        observacao: params.observacoes,
                    },
                    include: {
                        localEntrega: true,
                    },
                });

                await tx.empenhoItem.update({
                    where: {
                        id: item.empenhoItemId,
                    },
                    data: {
                        quantidadeEntregue: proximaQuantidade,
                    },
                });

                await tx.contratoItem.update({
                    where: {
                        id: empenhoItem.contratoItemId,
                    },
                    data: {
                        quantidadeEntregue: {
                            increment: item.quantidade,
                        },
                    },
                });

                entregas.push(entrega);
            }

            return entregas;
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
