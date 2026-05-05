export type DeleteLicitacaoDocumentView = {
    documentId: string;
    deleted: true;
};

export class DeleteLicitacaoDocumentMapper {
    static toView(documentId: string): DeleteLicitacaoDocumentView {
        return {
            documentId,
            deleted: true,
        };
    }
}
