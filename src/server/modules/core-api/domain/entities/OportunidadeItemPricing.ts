/**
 * Entidade: OportunidadeItemPricing
 *
 * Representa a decisao comercial da empresa para um item especifico
 * dentro de uma oportunidade.
 */
export type OportunidadeItemPricing = {
    id: string;
    oportunidadeItemId: string;
    quantidadeCotada: number | null;
    quantidadeAdesao: number | null;
    precoOfertaUnitario: number | null;
    precoOfertaTotal: number | null;
    custoUnitarioSnapshot: number | null;
    valorMinimoLance: number | null;
    ofertaMarca: string | null;
    ofertaModelo: string | null;
    garantiaDescricao: string | null;
    createdAt: Date;
    updatedAt: Date;
};
