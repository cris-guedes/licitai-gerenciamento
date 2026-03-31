export type FetchExternalProcurementFilesView = {
    files: Array<{
        url?: string
        titulo?: string
        tipoDocumentoNome?: string
        sequencialDocumento?: number
        dataPublicacaoPncp?: string
    }>
}

export class FetchExternalProcurementFilesMapper {
    static toView(data: any[]): FetchExternalProcurementFilesView {
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
