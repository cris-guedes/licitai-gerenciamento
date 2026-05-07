export type DeleteLicitacaoDraftView = {
    oportunidadeId: string;
    deletedDocuments: number;
    deleted: true;
};

export class DeleteLicitacaoDraftMapper {
    static toView(params: { oportunidadeId: string; deletedDocuments: number }): DeleteLicitacaoDraftView {
        return {
            oportunidadeId: params.oportunidadeId,
            deletedDocuments: params.deletedDocuments,
            deleted: true,
        };
    }
}
