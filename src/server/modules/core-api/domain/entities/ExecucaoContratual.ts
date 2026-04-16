/**
 * Entidade: ExecucaoContratual
 *
 * Representa as condições práticas de execução após o vencedor ser
 * definido: como e quando o fornecedor deve entregar o objeto,
 * receber o pagamento, ter sua entrega aceita e quais garantias oferece.
 *
 * Tudo aqui é sobre o "depois da disputa" — o que acontece no contrato.
 */
export type ExecucaoContratual = {
    /** Condições de entrega do objeto contratado */
    entrega: EntregaContratual;

    /** Condições de pagamento ao fornecedor */
    pagamento: PrazoContratual;

    /** Condições para aceite formal do objeto entregue */
    aceite: PrazoContratual;

    /**
     * Validade da proposta apresentada pelo fornecedor, em dias.
     * Durante esse período, o fornecedor está vinculado ao seu preço ofertado.
     */
    validadeProposta: number | null;

    /** Garantia do produto ou serviço após a entrega */
    garantia: GarantiaContratual;
};

/**
 * Condições de prazo com texto original do edital para rastreabilidade.
 */
export type PrazoContratual = {
    /** Prazo em dias (corridos ou úteis, conforme o edital) */
    prazoEmDias: number | null;

    /** Texto exato do edital que define o prazo, preservado para auditoria */
    textoOriginal: string | null;
};

/**
 * Condições específicas de entrega do objeto contratado.
 */
export type EntregaContratual = PrazoContratual & {
    /** Endereço ou local onde o objeto deve ser entregue */
    localEntrega: string | null;

    /**
     * Tipo de entrega:
     * - "centralizada": todos os itens em um único local
     * - "descentralizada": entregues em múltiplos endereços (ex: por unidade)
     */
    tipoEntrega: "centralizada" | "descentralizada" | null;

    /**
     * Quem é responsável pela instalação do bem entregue.
     * - "fornecedor": o próprio fornecedor instala
     * - "comprador": o órgão comprador é responsável
     */
    responsavelInstalacao: "fornecedor" | "comprador" | null;
};

/**
 * Garantia técnica do produto ou serviço oferecida pelo fornecedor.
 */
export type GarantiaContratual = {
    /**
     * Tipo de atendimento da garantia:
     * - "onsite": técnico vai ao local do órgão
     * - "balcao": órgão leva ao fornecedor
     * - "remota": atendimento via telefone/conexão remota
     * - "sem_garantia": sem previsão de garantia técnica
     */
    tipo: "onsite" | "balcao" | "remota" | "sem_garantia" | null;

    /** Duração da garantia em meses */
    meses: number | null;

    /** Tempo máximo de resposta/atendimento para chamados de garantia, em horas */
    tempoAtendimentoHoras: number | null;

    /** Trecho original do edital referente à garantia e assistência técnica */
    textoOriginal: string | null;
};
