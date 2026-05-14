export type EmpenhoEntrega = {
    id: string;
    empenhoItemId: string;
    localEntregaId: string | null;

    // ─── O que foi entregue ─────────────────────────────────────────────────
    descricao: string | null;
    quantidadeEntregue: number;
    numeroNotaFiscal: string | null;
    valorNotaFiscal: number | null;

    // ─── Timeline ───────────────────────────────────────────────────────────
    dataEntrega: Date | null;
    dataAceiteProvisorio: Date | null;
    dataAceiteDefinitivo: Date | null;
    dataLimitePagamento: Date | null;
    dataPagamento: Date | null;

    // ─── Conformidade ───────────────────────────────────────────────────────
    entregueNoPrazo: boolean | null;
    pagoNoPrazo: boolean | null;

    status: EmpenhoEntregaStatus;
    motivoRejeicao: string | null;
    observacao: string | null;

    createdAt: Date;
    updatedAt: Date;
};

export type EmpenhoEntregaStatus =
    | "PENDENTE"
    | "ENTREGUE"
    | "ACEITE_PROVISORIO"
    | "ACEITE_DEFINITIVO"
    | "PAGO"
    | "REJEITADO";
