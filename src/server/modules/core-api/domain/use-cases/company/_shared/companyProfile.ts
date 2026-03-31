import type { PrismaCompanyRepository } from "@/server/shared/infra/repositories/company.repository";

export type CompanySecondaryCnaeView = {
    codigo: number;
    descricao: string;
};

export type CompanyProfileView = {
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
    cnaes_secundarios: CompanySecondaryCnaeView[] | null;
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

export class CompanyProfileMapper {
    static toView(company: PrismaCompanyRepository.CompanyResponse): CompanyProfileView {
        return {
            id: company.id,
            cnpj: company.cnpj,
            razao_social: company.razao_social,
            nome_fantasia: company.nome_fantasia,
            situacao_cadastral: company.situacao_cadastral,
            data_situacao_cadastral: company.data_situacao_cadastral,
            data_abertura: company.data_abertura,
            porte: company.porte,
            natureza_juridica: company.natureza_juridica,
            cnae_fiscal: company.cnae_fiscal,
            cnae_fiscal_descricao: company.cnae_fiscal_descricao,
            cnaes_secundarios: this.normalizeSecondaryCnaes(company.cnaes_secundarios),
            logradouro: company.logradouro,
            numero: company.numero,
            complemento: company.complemento,
            bairro: company.bairro,
            municipio: company.municipio,
            uf: company.uf,
            cep: company.cep,
            telefone_1: company.telefone_1,
            email_empresa: company.email_empresa,
            capital_social: company.capital_social,
            opcao_pelo_simples: company.opcao_pelo_simples,
            opcao_pelo_mei: company.opcao_pelo_mei,
            organizationId: company.organizationId,
            createdAt: company.createdAt,
            updatedAt: company.updatedAt,
        };
    }

    static toManyView(companies: PrismaCompanyRepository.CompanyResponse[]): CompanyProfileView[] {
        return companies.map((company) => this.toView(company));
    }

    private static normalizeSecondaryCnaes(value: PrismaCompanyRepository.CompanyResponse["cnaes_secundarios"]): CompanySecondaryCnaeView[] | null {
        if (!Array.isArray(value)) return null;

        return value.flatMap((item) => {
            if (
                item &&
                typeof item === "object" &&
                "codigo" in item &&
                "descricao" in item &&
                typeof item.codigo === "number" &&
                typeof item.descricao === "string"
            ) {
                return [{
                    codigo: item.codigo,
                    descricao: item.descricao,
                }];
            }

            return [];
        });
    }
}
