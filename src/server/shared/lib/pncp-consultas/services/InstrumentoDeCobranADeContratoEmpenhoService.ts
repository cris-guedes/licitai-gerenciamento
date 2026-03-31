/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginaRetornoConsultarInstrumentoCobrancaDTO } from '../models/PaginaRetornoConsultarInstrumentoCobrancaDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class InstrumentoDeCobranADeContratoEmpenhoService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Consultar Instrumentos de Cobrança por Data de Inclusão
   * @returns PaginaRetornoConsultarInstrumentoCobrancaDTO OK
   * @throws ApiError
   */
  public consultarInstrumentos({
    dataInicial,
    dataFinal,
    pagina,
    tipoInstrumentoCobranca,
    cnpjOrgao,
    tamanhoPagina,
  }: {
    dataInicial: string,
    dataFinal: string,
    pagina: number,
    tipoInstrumentoCobranca?: number,
    cnpjOrgao?: string,
    tamanhoPagina?: number,
  }): CancelablePromise<PaginaRetornoConsultarInstrumentoCobrancaDTO> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/instrumentoscobranca/inclusao',
      query: {
        'dataInicial': dataInicial,
        'dataFinal': dataFinal,
        'tipoInstrumentoCobranca': tipoInstrumentoCobranca,
        'cnpjOrgao': cnpjOrgao,
        'pagina': pagina,
        'tamanhoPagina': tamanhoPagina,
      },
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
}
