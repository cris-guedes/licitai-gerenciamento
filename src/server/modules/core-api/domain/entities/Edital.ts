import type { OrgaoPublico } from "./OrgaoPublico";
import type { CronogramaLicitacao } from "./CronogramaLicitacao";
import type { RegrasCertame } from "./RegrasCertame";
import type { ItemLicitado } from "./ItemLicitado";
import type { ExecucaoContratual } from "./ExecucaoContratual";
import type { DocumentoHabilitacao } from "./DocumentoHabilitacao";

/**
 * Entidade: Edital
 *
 * Representa o **documento oficial** de uma licitação — o edital —
 * com todas as suas informações detalhadas e operacionais.
 *
 * O Edital é o objeto produzido pela análise inteligente do PDF, e contém
 * dados que podem ser complexos, mutáveis (via aditivos) e ricos em detalhe.
 *
 * Diferença em relação à Licitacao:
 * - `Licitacao` é o processo (rastreamento, identidade, situação)
 * - `Edital`    é o documento (regras, condições, itens, prazos)
 *
 * Um Edital pertence sempre a exatamente uma Licitacao.
 * Uma Licitacao pode ter seu Edital atualizado quando há retificações.
 */
export type Edital = {
    // ─── Fundamentação legal ─────────────────────────────────────────────────

    /**
     * Base legal que autoriza ou determina a forma de contratação.
     * Ex: "Art. 75, II da Lei 14.133/2021", "Lei 8.666/93, Art. 23".
     */
    amparoLegal: string | null;

    // ─── Órgãos participantes ─────────────────────────────────────────────────

    /**
     * Órgãos que participam da compra compartilhada mas não a conduzem.
     * Presentes em processos de Registro de Preços (SRP) e compras
     * compartilhadas entre entes federativos.
     */
    orgaosParticipantes: OrgaoPublico[];

    // ─── Cronograma da disputa ────────────────────────────────────────────────

    /**
     * Datas e prazos que estruturam o andamento do processo:
     * início e fim das propostas, sessão pública, esclarecimentos.
     */
    cronograma: CronogramaLicitacao;

    // ─── Regras do certame ────────────────────────────────────────────────────

    /**
     * Regras que definem como a disputa entre os fornecedores é conduzida:
     * modo de disputa, critério de julgamento, restrições de participação (ME/EPP),
     * permissão de adesão (carona) e outras condições do certame.
     */
    certame: RegrasCertame;

    // ─── Itens licitados ──────────────────────────────────────────────────────

    /**
     * Lista completa de bens ou serviços que serão adquiridos.
     * Cada item tem quantidade, valor estimado e descrição detalhada.
     */
    itens: ItemLicitado[];

    // ─── Condições de execução ────────────────────────────────────────────────

    /**
     * Condições práticas de execução do contrato:
     * como e quando o fornecedor entrega, recebe, e quais garantias oferece.
     */
    execucao: ExecucaoContratual;

    // ─── Habilitação exigida ──────────────────────────────────────────────────

    /**
     * Documentos que o fornecedor deve apresentar para comprovar
     * sua habilitação jurídica, fiscal, técnica e econômico-financeira.
     */
    habilitacao: DocumentoHabilitacao[];

    // ─── Informações complementares ───────────────────────────────────────────

    /**
     * Observações livres, notas do pregoeiro ou informações adicionais
     * extraídas do edital que não se enquadram nas demais categorias.
     */
    informacaoComplementar: string | null;

    /**
     * Trecho original do edital referente às informações gerais e amparo legal.
     */
    textoOriginal: string | null;
};
