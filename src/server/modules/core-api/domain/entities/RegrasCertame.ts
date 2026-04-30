/**
 * Entidade: RegrasCertame
 *
 * Representa as regras que definem como a disputa entre fornecedores
 * é conduzida: modo de julgamento, tipo de lance, participação e vigências.
 */
export type RegrasCertame = {
    // ── Disputa ──────────────────────────────────────────────────────────────
    modoDisputa: string | null;
    criterioJulgamento: string | null;
    tipoLance: "unitario" | "global" | "percentual" | null;
    intervaloLances: string | null;
    duracaoSessaoMinutos: number | null;

    // ── Participação ─────────────────────────────────────────────────────────
    exclusivoMeEpp: boolean | null;
    permiteConsorcio: boolean | null;
    exigeVisitaTecnica: boolean | null;
    regionalidade: string | null;

    // ── Adesão e Vigências ────────────────────────────────────────────────────
    permiteAdesao: boolean | null;
    percentualAdesao: number | null;
    vigenciaAtaMeses: number | null;
    vigenciaContratoDias: number | null;
    difal: boolean | null;
};
