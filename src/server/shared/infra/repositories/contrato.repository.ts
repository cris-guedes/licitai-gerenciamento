/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-namespace */
import { ContratoStatus, Prisma } from "@prisma/client";
import { prisma } from "../db/client";
import { Contrato } from "@/server/modules/core-api/domain/entities";

const contratoItemInclude = {
    oportunidadeItem: {
        include: {
            editalItem: true,
            pricing: true,
            disputa: true,
            companyItem: true,
        },
    },
} satisfies Prisma.ContratoItemInclude;

export class PrismaContratoRepository {
    async create(params: PrismaContratoRepository.CreateParams): Promise<Contrato> {
        return prisma.contrato.create({
            data: {
                companyId: params.companyId,
                oportunidadeId: params.oportunidadeId,
                status: params.status ?? "RASCUNHO",
                metadata: params.metadata ?? undefined,
                numeroContrato: params.numeroContrato,
                anoContrato: params.anoContrato,
                processo: params.processo,
                tipoContrato: params.tipoContrato,
                objetoContrato: params.objetoContrato,
                dataAssinatura: params.dataAssinatura,
                dataVigenciaInicio: params.dataVigenciaInicio,
                dataVigenciaFim: params.dataVigenciaFim,
                prazoEntregaDias: params.prazoEntregaDias,
                prazoPagamentoDias: params.prazoPagamentoDias,
                prazoAceiteDias: params.prazoAceiteDias,
                fornecedorCnpjCpf: params.fornecedorCnpjCpf,
                fornecedorNome: params.fornecedorNome,
                valorInicial: params.valorInicial,
                valorGlobal: params.valorGlobal,
                itens: {
                    create: params.itens.map(item => ({
                        oportunidadeItemId: item.oportunidadeItemId,
                        quantidadeContratada: item.quantidadeContratada,
                        valorUnitario: item.valorUnitario,
                        valorTotal: item.valorTotal,
                    })),
                },
            },
            include: {
                itens: true,
                oportunidade: {
                    include: {
                        licitacao: {
                            include: {
                                orgaoGerenciador: true,
                            },
                        },
                        edital: true,
                    },
                },
            },
        }) as unknown as Contrato; // using unknown to cast Prisma generated type to our domain type where Decimal != number
    }

    async findById(params: { id: string; companyId?: string }): Promise<Contrato | null> {
        return prisma.contrato.findFirst({
            where: {
                id: params.id,
                ...(params.companyId ? { companyId: params.companyId } : {}),
            },
            include: {
                itens: true,
            },
        }) as unknown as Promise<Contrato | null>;
    }

    async listByCompanyId(params: { companyId: string; oportunidadeId?: string }): Promise<Contrato[]> {
        return prisma.contrato.findMany({
            where: {
                companyId: params.companyId,
                ...(params.oportunidadeId ? { oportunidadeId: params.oportunidadeId } : {}),
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                itens: true,
                oportunidade: {
                    include: {
                        licitacao: {
                            include: {
                                orgaoGerenciador: true,
                            },
                        },
                        edital: true,
                    },
                },
            },
        }) as unknown as Promise<Contrato[]>;
    }

    async update(params: PrismaContratoRepository.UpdateParams): Promise<Contrato> {
        return prisma.contrato.update({
            where: {
                id: params.id,
                companyId: params.companyId,
            },
            data: {
                numeroContrato: params.numeroContrato,
                anoContrato: params.anoContrato,
                processo: params.processo,
                tipoContrato: params.tipoContrato,
                objetoContrato: params.objetoContrato,
                dataAssinatura: params.dataAssinatura,
                dataVigenciaInicio: params.dataVigenciaInicio,
                dataVigenciaFim: params.dataVigenciaFim,
                fornecedorCnpjCpf: params.fornecedorCnpjCpf,
                fornecedorNome: params.fornecedorNome,
                valorInicial: params.valorInicial,
                valorGlobal: params.valorGlobal,
                status: params.status,
            },
            include: {
                itens: true,
                oportunidade: {
                    include: {
                        licitacao: {
                            include: {
                                orgaoGerenciador: true,
                            },
                        },
                        edital: true,
                    },
                },
            },
        }) as unknown as Contrato;
    }

    async findWorkspaceById(params: { id: string; companyId: string }): Promise<any | null> {
        return prisma.contrato.findFirst({
            where: {
                id: params.id,
                companyId: params.companyId,
            },
            include: {
                oportunidade: {
                    include: {
                        licitacao: true,
                        edital: true,
                        itens: {
                            include: {
                                editalItem: true,
                                pricing: true,
                                disputa: true,
                                companyItem: true,
                            },
                            orderBy: [
                                { editalItem: { numeroItem: "asc" } },
                                { createdAt: "asc" },
                            ],
                        },
                    }
                },
                itens: {
                    include: contratoItemInclude,
                },
                empenhos: {
                    orderBy: { createdAt: "desc" },
                    include: {
                        itens: {
                            include: {
                                contratoItem: {
                                    include: {
                                        oportunidadeItem: {
                                            include: {
                                                editalItem: true,
                                            },
                                        },
                                    },
                                },
                                entregas: true,
                            },
                        },
                        locaisEntrega: {
                            include: {
                                entregas: true,
                            },
                        },
                    }
                }
            },
        });
    }

    async findItemById(params: PrismaContratoRepository.FindItemByIdParams): Promise<any | null> {
        return prisma.contratoItem.findFirst({
            where: {
                id: params.contratoItemId,
                contratoId: params.contratoId,
                contrato: {
                    companyId: params.companyId,
                },
            },
            include: {
                ...contratoItemInclude,
                _count: {
                    select: {
                        empenhoItens: true,
                    },
                },
            },
        });
    }

    async findItemByOpportunityItem(params: PrismaContratoRepository.FindItemByOpportunityItemParams): Promise<any | null> {
        return prisma.contratoItem.findFirst({
            where: {
                contratoId: params.contratoId,
                oportunidadeItemId: params.oportunidadeItemId,
                contrato: {
                    companyId: params.companyId,
                },
            },
            include: contratoItemInclude,
        });
    }

    async findOpportunityItemForContrato(params: PrismaContratoRepository.FindOpportunityItemForContratoParams): Promise<any | null> {
        const contrato = await prisma.contrato.findFirst({
            where: {
                id: params.contratoId,
                companyId: params.companyId,
            },
            select: {
                oportunidadeId: true,
            },
        });

        if (!contrato) return null;

        return prisma.oportunidadeItem.findFirst({
            where: {
                id: params.oportunidadeItemId,
                oportunidadeId: contrato.oportunidadeId,
            },
            include: {
                editalItem: true,
                pricing: true,
                disputa: true,
                companyItem: true,
            },
        });
    }

    async createItem(params: PrismaContratoRepository.CreateItemParams): Promise<any> {
        return prisma.contratoItem.create({
            data: {
                contratoId: params.contratoId,
                oportunidadeItemId: params.oportunidadeItemId,
                quantidadeContratada: params.quantidadeContratada,
                valorUnitario: params.valorUnitario,
                valorTotal: params.valorTotal,
            },
            include: contratoItemInclude,
        });
    }

    async updateItem(params: PrismaContratoRepository.UpdateItemParams): Promise<any> {
        return prisma.contratoItem.update({
            where: {
                id: params.contratoItemId,
            },
            data: {
                quantidadeContratada: params.quantidadeContratada,
                valorUnitario: params.valorUnitario,
                valorTotal: params.valorTotal,
            },
            include: contratoItemInclude,
        });
    }

    async deleteItem(params: PrismaContratoRepository.DeleteItemParams): Promise<void> {
        await prisma.contratoItem.delete({
            where: {
                id: params.contratoItemId,
            },
        });
    }
}

export namespace PrismaContratoRepository {
    export type CreateParams = {
        companyId: string;
        oportunidadeId: string;
        numeroContrato?: string | null;
        anoContrato?: number | null;
        processo?: string | null;
        tipoContrato?: string | null;
        objetoContrato?: string | null;
        status?: ContratoStatus;

        dataAssinatura?: Date | null;
        dataVigenciaInicio?: Date | null;
        dataVigenciaFim?: Date | null;

        prazoEntregaDias?: number | null;
        prazoPagamentoDias?: number | null;
        prazoAceiteDias?: number | null;

        fornecedorCnpjCpf?: string | null;
        fornecedorNome?: string | null;

        valorInicial?: number | null;
        valorGlobal?: number | null;
        metadata?: Prisma.InputJsonValue | null;

        itens: Array<{
            oportunidadeItemId: string;
            quantidadeContratada?: number | null;
            valorUnitario?: number | null;
            valorTotal?: number | null;
        }>;
    };

    export type UpdateParams = {
        id: string;
        companyId: string;
        numeroContrato?: string | null;
        anoContrato?: number | null;
        processo?: string | null;
        tipoContrato?: string | null;
        objetoContrato?: string | null;

        dataAssinatura?: Date | null;
        dataVigenciaInicio?: Date | null;
        dataVigenciaFim?: Date | null;

        fornecedorCnpjCpf?: string | null;
        fornecedorNome?: string | null;

        valorInicial?: number | null;
        valorGlobal?: number | null;
        status?: ContratoStatus;
    };

    export type FindItemByIdParams = {
        companyId: string;
        contratoId: string;
        contratoItemId: string;
    };

    export type FindItemByOpportunityItemParams = {
        companyId: string;
        contratoId: string;
        oportunidadeItemId: string;
    };

    export type FindOpportunityItemForContratoParams = {
        companyId: string;
        contratoId: string;
        oportunidadeItemId: string;
    };

    export type CreateItemParams = {
        contratoId: string;
        oportunidadeItemId: string;
        quantidadeContratada?: number | null;
        valorUnitario?: number | null;
        valorTotal?: number | null;
    };

    export type UpdateItemParams = {
        contratoItemId: string;
        quantidadeContratada?: number | null;
        valorUnitario?: number | null;
        valorTotal?: number | null;
    };

    export type DeleteItemParams = {
        contratoItemId: string;
    };
}
