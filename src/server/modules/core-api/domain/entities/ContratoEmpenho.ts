export type ContratoEmpenho = {
    id: string;
    contratoId: string;

    // ─── Identificação ──────────────────────────────────────────────────────
    numeroEmpenho: string;
    tipoEmpenho: string | null;
    valor: number;
    dataEmissao: Date | null;

    // ─── Órgão emissor (1 por empenho) ──────────────────────────────────────
    orgaoCnpj: string | null;
    orgaoNome: string | null;
    orgaoUnidadeNome: string | null;

    observacao: string | null;
    status: ContratoEmpenhoStatus;

    createdAt: Date;
    updatedAt: Date;
};

export type ContratoEmpenhoStatus =
    | "ATIVO"
    | "CANCELADO"
    | "UTILIZADO";
