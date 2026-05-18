/**
 * Entidade: OportunidadeItem
 *
 * Representa um item oficial do edital que a empresa decidiu efetivamente
 * gerenciar dentro de uma oportunidade, incluindo seu estado operacional,
 * o vinculo opcional com o catalogo interno e os detalhes de precificacao.
 *
 * Esta entidade nao replica os dados ricos do edital nem do catalogo.
 * Ela coordena o trabalho interno da empresa sobre aquele item.
 */
export type OportunidadeItemStatus =
    | "PENDING_PRICING"
    | "READY_FOR_BID"
    | "IN_BIDDING"
    | "WON"
    | "LOST"
    | "DISCARDED";

export type OportunidadeItem = {
    id: string;

    /** Oportunidade dona do vínculo interno de gestão. */
    oportunidadeId: string;

    /** Item oficial do edital que passou a ser gerenciado. */
    editalItemId: string;

    /** Item interno da empresa escolhido para atender o item do edital. */
    companyItemId: string | null;

    /** Indica se o item continua considerado na proposta da empresa. */
    isSelected: boolean;

    /** Estado operacional do item no fluxo de precificação e disputa. */
    status: OportunidadeItemStatus;

    /** Observações livres do time comercial para este item. */
    observacaoInterna: string | null;

    createdAt: Date;
    updatedAt: Date;
};
