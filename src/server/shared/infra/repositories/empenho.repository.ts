/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */
import { Prisma } from "@prisma/client";
import { prisma } from "../db/client";
import { ContratoEmpenho } from "@/server/modules/core-api/domain/entities";

export class PrismaEmpenhoRepository {
    async createWithItems(params: PrismaEmpenhoRepository.CreateWithItemsParams): Promise<ContratoEmpenho> {
        return prisma.$transaction(async (tx) => {
            if (params.itens.length === 0) {
                throw new Error("Informe ao menos um item para criar o empenho");
            }

            const resolvedItems: Array<{
                contratoItemId: string;
                quantidade: number;
                valorUnitario: number | null;
                valorTotal: number | null;
            }> = [];

            // 1. Validar limites de cada ContratoItem
            for (const item of params.itens) {
                const contratoItem = await tx.contratoItem.findUnique({
                    where: { id: item.contratoItemId },
                    select: {
                        quantidadeContratada: true,
                        quantidadeEmpenhada: true,
                        valorUnitario: true,
                    }
                });

                if (!contratoItem) {
                    throw new Error(`Item de contrato não encontrado: ${item.contratoItemId}`);
                }

                if (Number(item.quantidade) <= 0) {
                    throw new Error(`Quantidade inválida para o item ${item.contratoItemId}`);
                }

                if (contratoItem.quantidadeContratada !== null) {
                    const novaQuantidadeEmpenhada = Number(contratoItem.quantidadeEmpenhada) + Number(item.quantidade);
                    if (novaQuantidadeEmpenhada > Number(contratoItem.quantidadeContratada)) {
                        throw new Error(`Quantidade a empenhar excede o saldo do contrato para o item ${item.contratoItemId}`);
                    }
                }

                const valorUnitario = item.valorUnitario ?? (contratoItem.valorUnitario === null ? null : Number(contratoItem.valorUnitario));
                const valorTotal = item.valorTotal ?? (
                    valorUnitario === null
                        ? null
                        : Number((Number(item.quantidade) * valorUnitario).toFixed(2))
                );

                resolvedItems.push({
                    contratoItemId: item.contratoItemId,
                    quantidade: item.quantidade,
                    valorUnitario,
                    valorTotal,
                });

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

            const numeroEmpenho = params.numeroEmpenho?.trim()
                || await generateNumeroEmpenho(tx, params.contratoId);
            const valor = params.valor ?? resolvedItems.reduce((total, item) => total + Number(item.valorTotal ?? 0), 0);

            // 2. Criar o Empenho
            const empenho = await tx.contratoEmpenho.create({
                data: {
                    contratoId: params.contratoId,
                    numeroEmpenho,
                    tipoEmpenho: params.tipoEmpenho,
                    valor,
                    dataEmissao: params.dataEmissao,
                    orgaoCnpj: params.orgaoCnpj,
                    orgaoNome: params.orgaoNome,
                    orgaoUnidadeNome: params.orgaoUnidadeNome,
                    observacao: params.observacao,
                    status: params.status ?? "ATIVO",
                    itens: {
                        create: resolvedItems.map(i => ({
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
        numeroEmpenho?: string | null;
        tipoEmpenho?: string | null;
        valor?: number | null;
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

async function generateNumeroEmpenho(
    tx: Prisma.TransactionClient,
    contratoId: string,
) {
    const year = new Date().getFullYear();
    let sequence = await tx.contratoEmpenho.count({ where: { contratoId } }) + 1;

    while (sequence < 10_000) {
        const candidate = `EMP-${String(sequence).padStart(4, "0")}/${year}`;
        const existing = await tx.contratoEmpenho.findFirst({
            where: {
                contratoId,
                numeroEmpenho: candidate,
            },
            select: {
                id: true,
            },
        });

        if (!existing) return candidate;
        sequence += 1;
    }

    return `EMP-${Date.now().toString(36).toUpperCase()}`;
}
