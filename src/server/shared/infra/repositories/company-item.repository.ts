/* eslint-disable @typescript-eslint/no-namespace */
import { prisma } from "../db/client";

export class PrismaCompanyItemRepository {
    async create(data: PrismaCompanyItemRepository.CreateParams): Promise<PrismaCompanyItemRepository.CompanyItemResponse> {
        return prisma.companyItem.create({ data });
    }

    async findById({ id }: PrismaCompanyItemRepository.FindByIdParams): Promise<PrismaCompanyItemRepository.CompanyItemResponse | null> {
        return prisma.companyItem.findUnique({ where: { id } });
    }

    async findByCompanyIdAndCodigo({
        companyId,
        codigo,
    }: PrismaCompanyItemRepository.FindByCompanyIdAndCodigoParams): Promise<PrismaCompanyItemRepository.CompanyItemResponse | null> {
        return prisma.companyItem.findUnique({
            where: {
                companyId_codigo: {
                    companyId,
                    codigo,
                },
            },
        });
    }

    async listByCompanyId({
        companyId,
    }: PrismaCompanyItemRepository.ListByCompanyIdParams): Promise<PrismaCompanyItemRepository.CompanyItemResponse[]> {
        return prisma.companyItem.findMany({
            where: { companyId },
            orderBy: [
                { descricao: "asc" },
                { createdAt: "asc" },
            ],
        });
    }

    async update({
        id,
        data,
    }: PrismaCompanyItemRepository.UpdateParams): Promise<PrismaCompanyItemRepository.CompanyItemResponse> {
        return prisma.companyItem.update({
            where: { id },
            data,
        });
    }

    async delete({ id }: PrismaCompanyItemRepository.DeleteParams): Promise<PrismaCompanyItemRepository.CompanyItemResponse> {
        return prisma.companyItem.delete({ where: { id } });
    }
}

export namespace PrismaCompanyItemRepository {
    export type CreateParams = {
        id?: string;
        companyId: string;
        codigo: string;
        descricao: string;
        marca?: string | null;
        unidadeMedida: string;
        imageUrl?: string | null;
        precoReferencia?: number | null;
        ativo?: boolean;
        createdAt?: Date;
        updatedAt?: Date;
    };

    export type CompanyItemResponse = {
        id: string;
        companyId: string;
        codigo: string;
        descricao: string;
        marca: string | null;
        unidadeMedida: string;
        imageUrl: string | null;
        precoReferencia: number | null;
        ativo: boolean;
        createdAt: Date;
        updatedAt: Date;
    };

    export type FindByIdParams = {
        id: string;
    };

    export type FindByCompanyIdAndCodigoParams = {
        companyId: string;
        codigo: string;
    };

    export type ListByCompanyIdParams = {
        companyId: string;
    };

    export type UpdateData = Partial<Omit<CreateParams, "id" | "companyId" | "createdAt" | "updatedAt">>;

    export type UpdateParams = {
        id: string;
        data: UpdateData;
    };

    export type DeleteParams = {
        id: string;
    };
}
