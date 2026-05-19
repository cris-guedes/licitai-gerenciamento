export type CreateContratoItemDTO = {
    companyId: string;
    contratoId: string;
    oportunidadeItemId: string;
    quantidadeContratada?: number | null;
    valorUnitario?: number | null;
    valorTotal?: number | null;
};
