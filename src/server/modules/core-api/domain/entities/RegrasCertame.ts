/**
 * Entidade: RegrasCertame
 *
 * Representa as regras que definem como a disputa entre fornecedores
 * é conduzida: modo de julgamento, tipo de instrumento convocatório
 * e restrições de participação.
 *
 * Essas regras são definidas pelo órgão no edital e são imutáveis
 * durante o curso do processo licitatório.
 */
export type RegrasCertame = {
    /**
     * Forma como os lances são realizados durante a disputa.
     * Ex: "aberto", "fechado", "aberto_fechado".
     */
    modoDisputa: string | null;

    /**
     * Critério que determina o vencedor da disputa.
     * Ex: "menor_preco", "maior_desconto", "melhor_tecnica".
     */
    criterioJulgamento: string | null;

    /**
     * Tipo do documento que convoca os fornecedores.
     * Ex: "edital", "aviso_dispensa", "termo_referencia".
     */
    tipoInstrumento: string | null;

    /**
     * Intervalo mínimo de diferença entre um lance e o próximo.
     * Pode ser expresso como percentual ou valor fixo.
     */
    intervaloLances: string | null;

    /**
     * Indica se o processo é exclusivo para Microempresas (ME)
     * e Empresas de Pequeno Porte (EPP).
     * Fundamentado na Lei Complementar 123/2006.
     */
    exclusivoMeEpp: boolean | null;

    /**
     * Indica se outros órgãos podem aderir à ata de registro de preços
     * gerada por este processo (carona).
     */
    permiteAdesao: boolean | null;

    /**
     * Percentual máximo permitido para adesão de órgãos externos (carona).
     * Expresso como número inteiro (ex: 25 = 25%).
     */
    percentualAdesao: number | null;

    /**
     * Restrição geográfica de participação de fornecedores, se houver.
     * Ex: "somente fornecedores do estado de MT".
     */
    regionalidade: string | null;

    /**
     * Indica se há incidência de DIFAL (Diferencial de Alíquota ICMS)
     * nas aquisições deste processo.
     */
    difal: boolean | null;
};
