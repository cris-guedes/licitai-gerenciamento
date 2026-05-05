/* eslint-disable @typescript-eslint/no-namespace */
import { EditalStatus, LicitacaoStatus, Prisma } from "@prisma/client";
import type { PrismaDocumentRepository } from "./document.repository";
import { prisma } from "../db/client";

export class PrismaLicitacaoRepository {
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
}
