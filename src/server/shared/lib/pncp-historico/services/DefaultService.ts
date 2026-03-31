/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HistoricoCompraItem } from '../models/HistoricoCompraItem';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
  /**
   * Consultar histórico de alterações de uma contratação
   * @returns HistoricoCompraItem Histórico retornado com sucesso
   * @throws ApiError
   */
  public static consultarHistoricoCompra({
    cnpj,
    ano,
    sequencial,
    pagina = 1,
    tamanhoPagina = 50,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    pagina?: number,
    tamanhoPagina?: number,
  }): CancelablePromise<Array<HistoricoCompraItem>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}/historico',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
      },
      query: {
        'pagina': pagina,
        'tamanhoPagina': tamanhoPagina,
      },
    });
  }
}
