import { Prisma } from "@prisma/client";
import { prisma } from "../db/client";

export class PrismaCompanyRepository {
    async create(data: PrismaCompanyRepository.CreateParams): Promise<PrismaCompanyRepository.CompanyResponse> {
        return prisma.company.create({
            data: {
                ...data,
                cnaes_secundarios: this.toJsonInput(data.cnaes_secundarios),
            },
        });
    }

    async findByCnpj({ cnpj }: { cnpj: string }): Promise<PrismaCompanyRepository.CompanyResponse | null> {
        return prisma.company.findUnique({ where: { cnpj } });
    }

    async findById({ id }: { id: string }): Promise<PrismaCompanyRepository.CompanyResponse | null> {
        return prisma.company.findUnique({ where: { id } });
    }

    async findByOrganizationId({ organizationId }: { organizationId: string }): Promise<PrismaCompanyRepository.CompanyResponse[]> {
        return prisma.company.findMany({
            where: { organizationId },
            orderBy: { createdAt: "asc" },
        });
    }

    async update({ id, data }: PrismaCompanyRepository.UpdateParams): Promise<PrismaCompanyRepository.CompanyResponse> {
        return prisma.company.update({
            where: { id },
            data: {
                ...data,
                cnaes_secundarios: this.toJsonInput(data.cnaes_secundarios),
            },
        });
    }

    async delete({ id }: { id: string }): Promise<PrismaCompanyRepository.CompanyResponse> {
        return prisma.company.delete({ where: { id } });
    }

    private toJsonInput(value: Prisma.InputJsonValue | null | undefined) {
        if (value === undefined) return undefined;
        if (value === null) return Prisma.JsonNull;
        return value;
    }
}

export namespace PrismaCompanyRepository {
    export type CompanySecondaryCnae = {
        codigo: number;
        descricao: string;
    };

    export type CreateParams = {
        cnpj: string;
        razao_social: string;
        nome_fantasia?: string | null;
        situacao_cadastral?: string | null;
        data_situacao_cadastral?: string | null;
        data_abertura?: string | null;
        porte?: string | null;
        natureza_juridica?: string | null;
        cnae_fiscal?: number | null;
        cnae_fiscal_descricao?: string | null;
        cnaes_secundarios?: Prisma.InputJsonValue | null;
        logradouro?: string | null;
        numero?: string | null;
        complemento?: string | null;
        bairro?: string | null;
        municipio?: string | null;
        uf?: string | null;
        cep?: string | null;
        telefone_1?: string | null;
        email_empresa?: string | null;
        capital_social?: number | null;
        opcao_pelo_simples?: boolean | null;
        opcao_pelo_mei?: boolean | null;
        organizationId: string;
    };

    export type CompanyResponse = {
        id: string;
        cnpj: string;
        razao_social: string;
        nome_fantasia: string | null;
        situacao_cadastral: string | null;
        data_situacao_cadastral: string | null;
        data_abertura: string | null;
        porte: string | null;
        natureza_juridica: string | null;
        cnae_fiscal: number | null;
        cnae_fiscal_descricao: string | null;
        cnaes_secundarios: Prisma.JsonValue | null;
        logradouro: string | null;
        numero: string | null;
        complemento: string | null;
        bairro: string | null;
        municipio: string | null;
        uf: string | null;
        cep: string | null;
        telefone_1: string | null;
        email_empresa: string | null;
        capital_social: number | null;
        opcao_pelo_simples: boolean | null;
        opcao_pelo_mei: boolean | null;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
    };

    export type UpdateData = Partial<Omit<CreateParams, "organizationId">>;

    export type UpdateParams = {
        id: string;
        data: UpdateData;
    };
}
