/**
 * Entidade: ItemLicitado
 *
 * Representa um item individual dentro de um processo licitatório.
 * Cada item descreve um bem ou serviço que o órgão pretende adquirir,
 * com suas quantidades e valores estimados.
 *
 * Um processo pode conter múltiplos itens agrupados ou não em lotes.
 */
export type ItemLicitado = {
    /** Número sequencial do item no edital */
    numero: number;

    /** Descrição detalhada do bem ou serviço */
    descricao: string | null;

    /**
     * Classifica o item como material físico ou serviço.
     * - "material": bem tangível (equipamento, produto, etc.)
     * - "servico": prestação de serviço
     */
    tipo: "material" | "servico" | null;

    /** Identificador do lote ao qual o item pertence, se aplicável */
    lote: string | null;

    /** Quantidade a ser adquirida */
    quantidade: number | null;

    /** Unidade de medida (ex: "UN", "KG", "M²", "HORA") */
    unidadeMedida: string | null;

    /** Valor unitário estimado pelo órgão (em reais) */
    valorUnitarioEstimado: number | null;

    /** Valor total estimado para o item = quantidade × valorUnitario (em reais) */
    valorTotal: number | null;

    /**
     * Código da Nomenclatura Comum do Mercosul (NCM) ou
     * Nomenclatura Brasileira de Serviços (NBS), quando aplicável.
     */
    codigoNcmNbs: string | null;

    /** Descrição do código NCM/NBS */
    descricaoNcmNbs: string | null;

    /**
     * Critério de julgamento específico para este item,
     * quando diferente do critério geral do certame.
     * Ex: "menor_preco", "maior_desconto".
     */
    criterioJulgamento: string | null;

    /**
     * Regime tributário ou benefício fiscal aplicável ao item.
     * Ex: benefício para microempresas, conteúdo nacional, etc.
     */
    beneficioTributario: string | null;

    /** Informações complementares ou observações específicas do item */
    observacao: string | null;
};
