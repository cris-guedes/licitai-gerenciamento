import type { ExtractEditalDataResponse } from '../models/ExtractEditalDataResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class LicitacaoService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * Extrai dados de um edital a partir da URL do PDF
     * Baixa o PDF, converte para Markdown via Docling e salva os arquivos na pasta temp.
     * @returns ExtractEditalDataResponse Markdown extraído + métricas
     * @throws ApiError
     */
    public extractEditalData({
        pdfUrl,
    }: {
        pdfUrl: string;
    }): CancelablePromise<ExtractEditalDataResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/extract-edital-data',
            body: { pdfUrl },
            mediaType: 'application/json',
        });
    }
}
