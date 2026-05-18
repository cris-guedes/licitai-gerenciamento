/**
 * Entidade: OportunidadeItemDisputa
 *
 * Representa os dados operacionais correntes da disputa para um item
 * ja precificado dentro da oportunidade.
 */
export type OportunidadeItemDisputa = {
    id: string;
    oportunidadeItemId: string;
    ultimoLance: number | null;
    dataUltimoLance: Date | null;
    situacaoDisputa: string | null;
    observacaoOperacional: string | null;
    createdAt: Date;
    updatedAt: Date;
};
