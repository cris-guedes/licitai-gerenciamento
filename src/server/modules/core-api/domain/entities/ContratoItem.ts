export type ContratoItem = {
    id: string;
    contratoId: string;
    oportunidadeItemId: string;

    quantidadeContratada: number | null;
    valorUnitario: number | null;
    valorTotal: number | null;

    // ─── Saldos desnormalizados ─────────────────────────────────────────────
    quantidadeEmpenhada: number;
    quantidadeEntregue: number;
    quantidadePaga: number;

    createdAt: Date;
    updatedAt: Date;
};
