export type Contrato = {
    id: string;
    oportunidadeId: string;
    companyId: string;

    // ─── Identificação ──────────────────────────────────────────────────────
    numeroContrato: string | null;
    anoContrato: number | null;
    processo: string | null;
    objetoContrato: string | null;
    tipoContrato: string | null;

    // ─── Fornecedor (nós) ──────────────────────────────────────────────────
    fornecedorCnpjCpf: string | null;
    fornecedorNome: string | null;

    // ─── Valores ────────────────────────────────────────────────────────────
    valorInicial: number | null;
    valorGlobal: number | null;

    // ─── Vigência ───────────────────────────────────────────────────────────
    dataAssinatura: Date | null;
    dataVigenciaInicio: Date | null;
    dataVigenciaFim: Date | null;
    dataPublicacao: Date | null;

    // ─── Prazos padrão de execução (herdados do edital) ─────────────────────
    prazoEntregaDias: number | null;
    prazoPagamentoDias: number | null;
    prazoAceiteDias: number | null;

    // ─── Garantia ───────────────────────────────────────────────────────────
    garantiaTipo: string | null;
    garantiaMeses: number | null;

    // ─── Rastreabilidade externa ────────────────────────────────────────────
    numeroControlePncp: string | null;
    sequencialContrato: number | null;

    // ─── Status ─────────────────────────────────────────────────────────────
    status: ContratoStatus;
    informacaoComplementar: string | null;
    metadata: Record<string, unknown> | null;

    createdAt: Date;
    updatedAt: Date;
};

export type ContratoStatus =
    | "RASCUNHO"
    | "VIGENTE"
    | "ENCERRADO"
    | "RESCINDIDO"
    | "CANCELADO";
