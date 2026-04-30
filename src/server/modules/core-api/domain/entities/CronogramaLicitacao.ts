/**
 * Entidade: CronogramaLicitacao
 *
 * Representa as datas e prazos que regem o processo licitatório.
 * Todas as datas são strings no formato ISO 8601 (YYYY-MM-DD).
 * Horas são strings no formato HH:MM.
 */
export type CronogramaLicitacao = {
    acolhimentoInicio: string | null;
    acolhimentoFim: string | null;
    horaLimite: string | null;
    sessaoPublica: string | null;
    horaSessaoPublica: string | null;
    esclarecimentosAte: string | null;
    impugnacaoAte: string | null;
};
