export interface UpdateOportunidadeItemDTO {
    companyId: string;
    oportunidadeId: string;
    oportunidadeItemId: string;
    data: {
        editalItem?: {
            numeroItem?: string | number | null;
            descricao?: string | null;
            tipoItem?: "MATERIAL" | "SERVICO" | null;
            lote?: string | null;
            quantidadeTotal?: string | number | null;
            unidadeMedida?: string | null;
            valorUnitarioEstimado?: string | number | null;
            valorTotalEstimado?: string | number | null;
        };
        companyItemId?: string | null;
        isSelected?: boolean;
        status?: "PENDING_PRICING" | "READY_FOR_BID" | "IN_BIDDING" | "WON" | "LOST" | "DISCARDED";
        observacaoInterna?: string | null;
        pricing?: {
            quantidadeCotada?: string | number | null;
            quantidadeAdesao?: string | number | null;
            precoOfertaUnitario?: string | number | null;
            custoUnitarioSnapshot?: string | number | null;
            valorMinimoLance?: string | number | null;
            ofertaMarca?: string | null;
            ofertaModelo?: string | null;
            garantiaDescricao?: string | null;
        };
        disputa?: {
            ultimoLance?: string | number | null;
            dataUltimoLance?: string | null;
            situacaoDisputa?: string | null;
            observacaoOperacional?: string | null;
        };
    };
}
