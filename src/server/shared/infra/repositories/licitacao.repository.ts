/* eslint-disable @typescript-eslint/no-namespace */
import { EditalStatus, LicitacaoStatus, Prisma } from "@prisma/client";
import type { PrismaDocumentRepository } from "./document.repository";
import { prisma } from "../db/client";

export class PrismaLicitacaoRepository {
    async findById(
        params: PrismaLicitacaoRepository.FindByIdParams,
    ): Promise<PrismaLicitacaoRepository.LicitacaoResponse | null> {
        return prisma.licitacao.findFirst({
            where: {
                id: params.id,
                ...(params.companyId ? { companyId: params.companyId } : {}),
            },
        });
    }

    async createDraftWithEdital(
        params: PrismaLicitacaoRepository.CreateDraftWithEditalParams,
    ): Promise<PrismaLicitacaoRepository.CreateDraftWithEditalResponse> {
        return prisma.$transaction(async (tx) => {
            const licitacao = await tx.licitacao.create({
                data: {
                    id: params.licitacao.id,
                    companyId: params.licitacao.companyId,
                    createdById: params.licitacao.createdById,
                    status: params.licitacao.status,
                    metadados: params.licitacao.metadados ?? undefined,
                },
            });

            const edital = await tx.edital.create({
                data: {
                    id: params.edital.id,
                    licitacaoId: licitacao.id,
                    companyId: params.edital.companyId,
                    createdById: params.edital.createdById,
                    status: params.edital.status,
                },
            });

            return { licitacao, edital };
        });
    }

    async createDraftWithEditalAndDocument(
        params: PrismaLicitacaoRepository.CreateDraftWithEditalAndDocumentParams,
    ): Promise<PrismaLicitacaoRepository.CreateDraftWithEditalAndDocumentResponse> {
        return prisma.$transaction(async (tx) => {
            const licitacao = await tx.licitacao.create({
                data: {
                    id: params.licitacao.id,
                    companyId: params.licitacao.companyId,
                    createdById: params.licitacao.createdById,
                    status: params.licitacao.status,
                    metadados: params.licitacao.metadados ?? undefined,
                },
            });

            const edital = await tx.edital.create({
                data: {
                    id: params.edital.id,
                    licitacaoId: licitacao.id,
                    companyId: params.edital.companyId,
                    createdById: params.edital.createdById,
                    status: params.edital.status,
                },
            });

            const document = await tx.document.create({
                data: {
                    ...params.document,
                    editalId: edital.id,
                },
            });

            return { licitacao, edital, document };
        });
    }

    async listDraftsByCompanyId(
        params: PrismaLicitacaoRepository.ListDraftsByCompanyIdParams,
    ): Promise<PrismaLicitacaoRepository.LicitacaoDraftRecord[]> {
        return prisma.licitacao.findMany({
            where: {
                companyId: params.companyId,
                status: LicitacaoStatus.IN_PROGRESS,
            },
            include: {
                edital: {
                    include: {
                        documents: {
                            orderBy: [
                                { createdAt: "asc" },
                                { originalName: "asc" },
                            ],
                        },
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
        });
    }

    async findWorkspaceById(
        params: PrismaLicitacaoRepository.FindWorkspaceByIdParams,
    ): Promise<PrismaLicitacaoRepository.LicitacaoWorkspaceRecord | null> {
        return prisma.licitacao.findFirst({
            where: {
                id: params.licitacaoId,
                companyId: params.companyId,
            },
            include: {
                edital: {
                    include: {
                        documents: {
                            orderBy: [
                                { createdAt: "asc" },
                                { originalName: "asc" },
                            ],
                        },
                    },
                },
            },
        });
    }

    async update(
        params: PrismaLicitacaoRepository.UpdateParams,
    ): Promise<PrismaLicitacaoRepository.LicitacaoResponse> {
        return prisma.licitacao.update({
            where: { id: params.id },
            data: {
                ...params.data,
                metadados: this.toJsonInput(params.data.metadados),
            },
        });
    }

    async deleteDraftById(
        params: PrismaLicitacaoRepository.DeleteDraftByIdParams,
    ): Promise<PrismaLicitacaoRepository.LicitacaoResponse> {
        return prisma.$transaction(async (tx) => {
            if (params.documentIds.length > 0) {
                await tx.document.deleteMany({
                    where: {
                        id: { in: params.documentIds },
                    },
                });
            }

            return tx.licitacao.delete({
                where: { id: params.licitacaoId },
            });
        });
    }

    private toJsonInput(value: Prisma.InputJsonValue | null | undefined) {
        if (value === undefined) return undefined;
        if (value === null) return Prisma.JsonNull;
        return value;
    }
}

export namespace PrismaLicitacaoRepository {
    export type DraftLicitacaoParams = {
        id: string;
        companyId: string;
        createdById?: string | null;
        status: LicitacaoStatus;
        metadados?: Prisma.InputJsonValue | null;
    };

    export type DraftEditalParams = {
        id: string;
        companyId: string;
        createdById?: string | null;
        status: EditalStatus;
    };

    export type CreateDraftWithEditalAndDocumentParams = {
        licitacao: DraftLicitacaoParams;
        edital: DraftEditalParams;
        document: PrismaDocumentRepository.CreateParams;
    };

    export type CreateDraftWithEditalParams = {
        licitacao: DraftLicitacaoParams;
        edital: DraftEditalParams;
    };

    export type LicitacaoResponse = {
        id: string;
        companyId: string;
        createdById: string | null;
        status: LicitacaoStatus;
        metadados: Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    };

    export type EditalResponse = {
        id: string;
        licitacaoId: string;
        companyId: string;
        createdById: string | null;
        status: EditalStatus;
        orgaoCnpj: string | null;
        orgaoRazaoSocial: string | null;
        orgaoEsfera: string | null;
        orgaoPoder: string | null;
        unidadeCodigo: string | null;
        unidadeNome: string | null;
        municipio: string | null;
        uf: string | null;
        numero: string | null;
        processo: string | null;
        modalidade: string | null;
        tipoInstrumento: string | null;
        modoDisputa: string | null;
        amparoLegal: string | null;
        srp: boolean;
        objeto: string | null;
        informacaoComplementar: string | null;
        dataAbertura: Date | null;
        dataEncerramento: Date | null;
        valorEstimado: Prisma.Decimal | null;
        dadosExtraidos: Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    };

    export type CreateDraftWithEditalAndDocumentResponse = {
        licitacao: LicitacaoResponse;
        edital: EditalResponse;
        document: PrismaDocumentRepository.DocumentResponse;
    };

    export type CreateDraftWithEditalResponse = {
        licitacao: LicitacaoResponse;
        edital: EditalResponse;
    };

    export type ListDraftsByCompanyIdParams = {
        companyId: string;
    };

    export type FindByIdParams = {
        id: string;
        companyId?: string;
    };

    export type FindWorkspaceByIdParams = {
        licitacaoId: string;
        companyId: string;
    };

    export type UpdateData = {
        status?: LicitacaoStatus;
        metadados?: Prisma.InputJsonValue | null;
    };

    export type UpdateParams = {
        id: string;
        data: UpdateData;
    };

    export type DeleteDraftByIdParams = {
        licitacaoId: string;
        documentIds: string[];
    };

    export type DraftDocumentRecord = PrismaDocumentRepository.DocumentResponse;

    export type LicitacaoDraftRecord = LicitacaoResponse & {
        edital: (EditalResponse & {
            documents: DraftDocumentRecord[];
        }) | null;
    };

    export type LicitacaoWorkspaceRecord = LicitacaoDraftRecord;
}
