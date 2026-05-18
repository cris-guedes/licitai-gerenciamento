/**
 * Entidade: CompanyItem
 *
 * Representa um item do catalogo interno da empresa.
 *
 * Esse agregado e neutro em relacao a ERP, CSV ou cadastro manual.
 * Ele guarda apenas a identidade operacional minima do item.
 */
export type CompanyItem = {
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
