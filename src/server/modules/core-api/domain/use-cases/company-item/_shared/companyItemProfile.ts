import type { PrismaCompanyItemRepository } from "@/server/shared/infra/repositories/company-item.repository";

export type CompanyItemProfileView = {
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

export class CompanyItemProfileMapper {
    static toView(item: PrismaCompanyItemRepository.CompanyItemResponse): CompanyItemProfileView {
        return {
            id: item.id,
            companyId: item.companyId,
            codigo: item.codigo,
            descricao: item.descricao,
            marca: item.marca,
            unidadeMedida: item.unidadeMedida,
            imageUrl: item.imageUrl,
            precoReferencia: item.precoReferencia,
            ativo: item.ativo,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };
    }

    static toManyView(items: PrismaCompanyItemRepository.CompanyItemResponse[]): CompanyItemProfileView[] {
        return items.map(item => this.toView(item));
    }
}
