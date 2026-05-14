import { Prisma } from "@prisma/client";
import { prisma } from "../db/client";
import { ContratoEmpenho } from "@/server/modules/core-api/domain/entities";

export class PrismaEmpenhoRepository {
    async createWithItems(params: PrismaEmpenhoRepository.CreateWithItemsParams): Promise<ContratoEmpenho> {
        return prisma.$transaction(async (tx) => {
            // 1. Validar limites de cada ContratoItem
            for (const item of params.itens) {
                const contratoItem = await tx.contratoItem.findUnique({
                    where: { id: item.contratoItemId },
                    select: { quantidadeContratada: true, quantidadeEmpenhada: true }
                });

                if (!contratoItem) {
                    throw new Error(`Item de contrato não encontrado: ${item.contratoItemId}`);
                }

                if (contratoItem.quantidadeContratada !== null) {
                    const novaQuantidadeEmpenhada = Number(contratoItem.quantidadeEmpenhada) + Number(item.quantidade);
                    if (novaQuantidadeEmpenhada > Number(contratoItem.quantidadeContratada)) {
                        throw new Error(`Quantidade a empenhar excede o saldo do contrato para o item ${item.contratoItemId}`);
                    }
                }

                // Incrementar a quantidade empenhada no ContratoItem
                await tx.contratoItem.update({
                    where: { id: item.contratoItemId },
                    data: {
                        quantidadeEmpenhada: {
                            increment: item.quantidade
                        }
                    }
                });
            }

            // 2. Criar o Empenho
            const empenho = await tx.contratoEmpenho.create({
                data: {
                    contratoId: params.contratoId,
                    numeroEmpenho: params.numeroEmpenho,
                    tipoEmpenho: params.tipoEmpenho,
                    valor: params.valor,
                    dataEmissao: params.dataEmissao,
                    orgaoCnpj: params.orgaoCnpj,
                    orgaoNome: params.orgaoNome,
                    orgaoUnidadeNome: params.orgaoUnidadeNome,
                    observacao: params.observacao,
                    status: params.status ?? "ATIVO",
                    itens: {
                        create: params.itens.map(i => ({
                            contratoItemId: i.contratoItemId,
                            quantidade: i.quantidade,
                            valorUnitario: i.valorUnitario,
                            valorTotal: i.valorTotal,
                        }))
                    }
                },
                include: {
                    itens: true
                }
            });

            return empenho as unknown as ContratoEmpenho;
        });
    }

    async listByContratoId(contratoId: string): Promise<ContratoEmpenho[]> {
        return prisma.contratoEmpenho.findMany({
            where: { contratoId },
            orderBy: { createdAt: "desc" },
            include: {
                itens: true
            }
        }) as unknown as Promise<ContratoEmpenho[]>;
    }

    async addLocalEntrega(empenhoId: string, data: any): Promise<any> {
        const endereco = [
            data.logradouro,
            data.numero,
            data.complemento,
            data.bairro,
            data.cep,
        ].filter(Boolean).join(", ");

        return prisma.empenhoLocalEntrega.create({
            data: {
                empenhoId,
                descricao: data.orgaoNome,
                endereco: endereco || data.endereco,
                municipio: data.cidade ?? data.municipio,
                uf: data.estado ?? data.uf,
                responsavel: data.contatoNome ?? data.responsavel,
                telefone: data.contatoTelefone ?? data.telefone,
            }
        });
    }
}

export namespace PrismaEmpenhoRepository {
    export type CreateWithItemsParams = {
        contratoId: string;
        numeroEmpenho: string;
        tipoEmpenho?: string | null;
        valor: number;
        dataEmissao?: Date | null;
        
        orgaoCnpj?: string | null;
        orgaoNome?: string | null;
        orgaoUnidadeNome?: string | null;
        
        observacao?: string | null;
        status?: any;

        itens: Array<{
            contratoItemId: string;
            quantidade: number;
            valorUnitario?: number | null;
            valorTotal?: number | null;
        }>;
    };
}
