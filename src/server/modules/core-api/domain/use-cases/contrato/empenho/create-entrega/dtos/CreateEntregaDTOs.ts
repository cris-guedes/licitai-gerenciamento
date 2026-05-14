export interface CreateEntregaDTO {
    companyId: string;
    contratoId: string;
    empenhoId: string;
    empenhoItemId: string;
    quantidade: number;
    dataPrevista?: Date | null;
    observacoes?: string | null;
}
