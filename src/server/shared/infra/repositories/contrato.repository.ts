import { ContratoStatus, Prisma } from "@prisma/client";
import { prisma } from "../db/client";
import { Contrato } from "@/server/modules/core-api/domain/entities";

export class PrismaContratoRepository {
    async create(params: PrismaContratoRepository.CreateParams): Promise<Contrato> {
        return prisma.contrato.create({
            data: {
                companyId: params.companyId,
                oportunidadeId: params.oportunidadeId,
                status: params.status ?? "RASCUNHO",
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
                    }
                },
                itens: {
                    include: {
                        oportunidadeItem: {
                            include: {
                                editalItem: true
                            }
                        }
                    }
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
}
