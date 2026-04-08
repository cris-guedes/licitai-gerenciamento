import type { ExtractEditalDataResponse } from '../models/ExtractEditalDataResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export type ExtractionMode = "velocidade" | "balanceado" | "qualidade" | "imagem";

export class LicitacaoService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}

    public extractEditalData({
        pdfUrl,
        mode = "balanceado",
    }: {
        pdfUrl: string;
        mode?:  ExtractionMode;
    }): CancelablePromise<ExtractEditalDataResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/extract-edital-data',
            body: { pdfUrl, mode },
            mediaType: 'application/json',
        });
    }
}
