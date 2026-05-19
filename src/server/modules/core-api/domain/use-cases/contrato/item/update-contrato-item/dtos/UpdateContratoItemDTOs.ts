export type UpdateContratoItemDTO = {
    companyId: string;
    contratoId: string;
    contratoItemId: string;
    quantidadeContratada?: number | null;
    valorUnitario?: number | null;
    valorTotal?: number | null;
};
