export interface CreateCompanyItemDTO {
    companyId: string;
    codigo: string;
    descricao: string;
    marca?: string | null;
    unidadeMedida: string;
    imageUrl?: string | null;
    precoReferencia?: number | null;
    ativo?: boolean;
}
