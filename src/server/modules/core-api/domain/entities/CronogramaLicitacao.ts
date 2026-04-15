/**
 * Entidade: CronogramaLicitacao
 *
 * Representa as datas e prazos que regem o processo licitatório.
 * Define quando os fornecedores podem agir e quando a disputa acontece.
 *
 * Todas as datas são strings no formato ISO 8601 (YYYY-MM-DD).
 * Horas são strings no formato HH:MM.
 */
export type CronogramaLicitacao = {
    /**
     * Data de início do acolhimento de propostas.
     * A partir desta data os fornecedores podem cadastrar suas propostas.
     */
    acolhimentoInicio: string | null;

    /**
     * Data limite para envio de propostas.
     * Após essa data, nenhuma proposta nova é aceita.
     */
    acolhimentoFim: string | null;

    /**
     * Hora limite (HH:MM) para o envio de propostas no dia do encerramento.
     */
    horaLimite: string | null;

    /**
     * Data de abertura da sessão pública — o momento em que a
     * disputa entre os fornecedores tem início.
     */
    sessaoPublica: string | null;

    /**
     * Prazo final para que interessados enviem pedidos de
     * esclarecimento ou impugnação ao edital.
     */
    esclarecimentosAte: string | null;
};
