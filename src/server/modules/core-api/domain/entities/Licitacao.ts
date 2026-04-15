import { Edital } from "./Edital";
import type { OrgaoPublico } from "./OrgaoPublico";


/**
 * Entidade: Licitacao
 *
 * Aggregate root do domínio. Representa o **processo licitatório** em si —
 * o contêiner estável e rastreável de uma compra pública.
 *
 * Esta entidade concentra:
 * - Os atributos de identidade do processo (número, modalidade, órgão)
 * - Os atributos de rastreamento que mudam ao longo do tempo (situação,
 *   datas de publicação, valores homologados)
 * - Uma referência ao Edital completo, quando analisado
 *
 * O que NÃO fica aqui: detalhes operacionais do edital (itens, cronograma
 * da disputa, regras detalhadas). Esses pertencem ao Edital.
 *
 * Ciclo de vida de uma Licitacao:
 *   publicada → em_andamento → homologada (ou cancelada / suspensa)
 */
export type Licitacao = {
    // ─── Identidade ───────────────────────────────────────────────────────────

    /**
     * Número sequencial da licitação no exercício do órgão.
     * Ex: "04/2025"
     */
    numeroLicitacao: string | null;

    /** Ano do exercício em que o processo foi aberto. */
    ano: number | null;

    /**
     * Número do processo administrativo interno do órgão que originou
     * a licitação. Pode ser diferente do número do edital.
     * Ex: "031/2025"
     */
    processo: string | null;

    /**
     * Modalidade licitatória.
     * Ex: "pregao_eletronico", "dispensa", "concorrencia".
     */
    modalidade: string | null;

    /**
     * Resumo do objeto — o que o órgão pretende adquirir ou contratar.
     * Mantido aqui por ser a forma mais rápida de identificar o processo.
     */
    objeto: string | null;

    // ─── Órgão responsável ────────────────────────────────────────────────────

    /**
     * Órgão público que conduz e é responsável pelo processo.
     * Mantido na raiz pois é um atributo estável e essencial para rastreamento.
     */
    orgaoGerenciador: OrgaoPublico | null;

    // ─── Valores ──────────────────────────────────────────────────────────────

    /**
     * Valor total estimado pelo órgão antes da disputa.
     * Publicado no edital e raramente muda.
     */
    valorTotalEstimado: number | null;

    /**
     * Valor total efetivamente homologado após a disputa.
     * Preenchido após o encerramento — campo de rastreamento.
     */
    valorTotalHomologado: number | null;

    /**
     * Indica se o processo gera uma Ata de Registro de Preços (SRP),
     * permitindo adesões futuras de outros órgãos.
     */
    srp: boolean | null;

    // ─── Rastreamento ─────────────────────────────────────────────────────────

    /**
     * Situação atual do processo.
     * Campo de rastreamento — muda ao longo do ciclo de vida da licitação.
     */
    situacao: SituacaoLicitacao | null;

    /**
     * Data em que o processo foi publicado no portal de origem.
     * Formato ISO 8601 (YYYY-MM-DD).
     */
    dataPublicacao: string | null;

    /**
     * Data da última atualização registrada no processo.
     * Útil para detectar mudanças (aditivos, cancelamentos, etc.).
     */
    dataUltimaAtualizacao: string | null;

    /**
     * Link direto para o processo no portal de origem.
     * Permite acesso rápido à fonte primária.
     */
    linkProcesso: string | null;

    /**
     * Identificador único no portal de publicação externo.
     * Ex: número de controle PNCP, ID no Compras.gov.
     * Guardado para rastreabilidade e sincronização com fontes externas.
     */
    identificadorExterno: string | null;

    // ─── Edital completo ──────────────────────────────────────────────────────

    /**
     * O edital completo analisado pela IA.
     * Null quando o processo foi identificado mas o edital ainda não foi
     * processado ou não está disponível.
     */
    edital: Edital | null;
};

/**
 * Ciclo de vida de um processo licitatório.
 *
 * - "publicada":     edital publicado, aguardando abertura das propostas
 * - "em_andamento":  sessão pública em curso, propostas sendo avaliadas
 * - "homologada":    resultado definido e homologado pela autoridade
 * - "suspensa":      processo temporariamente paralisado
 * - "cancelada":     processo encerrado sem contratação
 * - "revogada":      processo anulado por razões de interesse público
 */
export type SituacaoLicitacao =
    | "publicada"
    | "em_andamento"
    | "homologada"
    | "suspensa"
    | "cancelada"
    | "revogada";
