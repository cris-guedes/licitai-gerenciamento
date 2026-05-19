export interface CreateEntregaDTO {
    companyId: string;
    contratoId: string;
    empenhoId: string;
    empenhoItemId?: string;
    quantidade?: number;
    itens?: Array<{
        empenhoItemId: string;
        quantidade: number;
    }>;
    localEntregaId?: string | null;
    dataPrevista?: Date | null;
    observacoes?: string | null;
}
