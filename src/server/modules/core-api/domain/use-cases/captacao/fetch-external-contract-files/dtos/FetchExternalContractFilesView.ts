export type FetchExternalContractFilesView = {
    files: Array<{
        url?:                string
        titulo?:             string
        tipoDocumentoNome?:  string
        sequencialDocumento?: number
        dataPublicacaoPncp?: string
    }>
}

export class FetchExternalContractFilesMapper {
    static toView(data: any[]): FetchExternalContractFilesView {
        return {
            files: (data ?? []).map((f: any) => ({
                url:                 f.url,
                titulo:              f.titulo,
                tipoDocumentoNome:   f.tipoDocumentoNome,
                sequencialDocumento: f.sequencialDocumento,
                dataPublicacaoPncp:  f.dataPublicacaoPncp,
            })),
        }
    }
}
