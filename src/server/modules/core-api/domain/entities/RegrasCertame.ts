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
    /** Trecho exato do edital sobre as regras de disputa (modo, critério, lances). */
    textoOriginalDisputa: string | null;

    // ── Participação ─────────────────────────────────────────────────────────
    exclusivoMeEpp: boolean | null;
    exclusivoMeEppTexto: string | null;
    permiteConsorcio: boolean | null;
    permiteConsorcioTexto: string | null;
    exigeVisitaTecnica: boolean | null;
    exigeVisitaTecnicaTexto: string | null;
    regionalidade: string | null;

    // ── Adesão e Vigências ────────────────────────────────────────────────────
    permiteAdesao: boolean | null;
    permiteAdesaoTexto: string | null;
    percentualAdesao: number | null;
    vigenciaAtaMeses: number | null;
    vigenciaAtaMesesTexto: string | null;
    vigenciaContratoDias: number | null;
    vigenciaContratoDiasTexto: string | null;
    difal: boolean | null;

    /** Trecho geral de onde as regras de certame foram extraídas (fallback). */
    textoOriginal: string | null;
};
