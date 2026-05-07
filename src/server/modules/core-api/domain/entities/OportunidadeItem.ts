/**
 * Entidade: OportunidadeItem
 *
 * Representa um item oficial do edital que a empresa decidiu efetivamente
 * gerenciar dentro de uma oportunidade.
 *
 * Esta entidade não replica os dados ricos do item. Ela apenas cria o vínculo
 * entre a oportunidade e o item oficial do edital.
 */
export type OportunidadeItem = {
    id: string;

    /** Oportunidade dona do vínculo interno de gestão. */
    oportunidadeId: string;

    /** Item oficial do edital que passou a ser gerenciado. */
    editalItemId: string;

    createdAt: Date;
    updatedAt: Date;
};
