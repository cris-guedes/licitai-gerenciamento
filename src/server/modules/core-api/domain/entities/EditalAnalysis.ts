/**
 * Entidade: EditalAnalysis
 *
 * Representa uma análise executada sobre o edital como contexto consolidado,
 * considerando o conjunto de documentos e regras que compõem aquele edital.
 *
 * Essa entidade existe para separar claramente:
 * - análises de documento isolado (`DocumentAnalysis`)
 * - análises de edital consolidado (`EditalAnalysis`)
 */
export type EditalAnalysis = {
    id: string;

    /** Edital ao qual esta análise consolidada pertence. */
    editalId: string;

    /** Empresa em cujo contexto a análise foi executada. */
    companyId: string;

    /** Usuário que iniciou a análise, quando aplicável. */
    createdById: string | null;

    /**
     * Tipo da análise consolidada.
     *
     * Tipos mínimos necessários hoje:
     * - `EXTRACT_CADASTRO`
     * - `SUMMARY_GERAL`
     */
    type: EditalAnalysisType;

    /** Estado de execução da análise. */
    status: EditalAnalysisStatus;

    /** Resultado estruturado da análise. */
    result: Record<string, unknown> | null;

    /** Métricas de execução, tokens, tempos e artefatos. */
    metrics: Record<string, unknown> | null;

    /** Mensagem de erro, quando a análise falha. */
    errorMessage: string | null;

    startedAt: Date | null;
    finishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export type EditalAnalysisType =
    | "EXTRACT_CADASTRO"
    | "SUMMARY_GERAL";

export type EditalAnalysisStatus =
    | "PENDING"
    | "RUNNING"
    | "COMPLETED"
    | "FAILED";
