export type EmpenhoItem = {
    id: string;
    empenhoId: string;
    contratoItemId: string;

    quantidade: number;
    valorUnitario: number | null;
    valorTotal: number | null;

    // ─── Saldos de execução ─────────────────────────────────────────────────
    quantidadeEntregue: number;
    quantidadeAceita: number;
    quantidadePaga: number;

    createdAt: Date;
    updatedAt: Date;
};
