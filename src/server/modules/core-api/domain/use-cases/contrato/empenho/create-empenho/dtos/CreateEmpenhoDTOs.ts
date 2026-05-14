export interface CreateEmpenhoDTO {
    contratoId: string;
    companyId: string; // From auth context, to ensure the user has access to the opportunity/contract

    numeroEmpenho: string;
    tipoEmpenho?: string;
    valor: number;
    dataEmissao?: Date;

    orgaoCnpj?: string;
    orgaoNome?: string;
    orgaoUnidadeNome?: string;

    observacao?: string;
    status?: string;

    itens: Array<{
        contratoItemId: string;
        quantidade: number;
        valorUnitario?: number;
        valorTotal?: number;
    }>;
}
