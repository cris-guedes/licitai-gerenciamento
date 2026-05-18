export interface UpdateCompanyItemDTO {
    companyId: string;
    companyItemId: string;
    data: {
        codigo?: string;
        descricao?: string;
        marca?: string | null;
        unidadeMedida?: string;
        imageUrl?: string | null;
        precoReferencia?: number | null;
        ativo?: boolean;
    };
}
