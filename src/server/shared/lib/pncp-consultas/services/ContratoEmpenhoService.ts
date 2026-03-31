/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginaRetornoRecuperarContratoDTO } from '../models/PaginaRetornoRecuperarContratoDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ContratoEmpenhoService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Consultar Contratos por Data de Publicação
   * @returns PaginaRetornoRecuperarContratoDTO OK
   * @throws ApiError
   */
  public consultarContratosPorDataPublicacao({
    dataInicial,
    dataFinal,
    pagina,
    cnpjOrgao,
    codigoUnidadeAdministrativa,
    usuarioId,
    tamanhoPagina,
  }: {
    dataInicial: string,
    dataFinal: string,
    pagina: number,
    cnpjOrgao?: string,
    codigoUnidadeAdministrativa?: string,
    usuarioId?: number,
    tamanhoPagina?: number,
  }): CancelablePromise<PaginaRetornoRecuperarContratoDTO> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/contratos',
      query: {
        'dataInicial': dataInicial,
        'dataFinal': dataFinal,
        'cnpjOrgao': cnpjOrgao,
        'codigoUnidadeAdministrativa': codigoUnidadeAdministrativa,
        'usuarioId': usuarioId,
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
  /**
   * Consultar Contratos/Empenhos por Data de Atualização Global
   * @returns PaginaRetornoRecuperarContratoDTO OK
   * @throws ApiError
   */
  public consultarContratosPorDataAtualizacaoGlobal({
    dataInicial,
    dataFinal,
    pagina,
    cnpjOrgao,
    codigoUnidadeAdministrativa,
    usuarioId,
    tamanhoPagina,
  }: {
    dataInicial: string,
    dataFinal: string,
    pagina: number,
    cnpjOrgao?: string,
    codigoUnidadeAdministrativa?: string,
    usuarioId?: number,
    tamanhoPagina?: number,
  }): CancelablePromise<PaginaRetornoRecuperarContratoDTO> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/contratos/atualizacao',
      query: {
        'dataInicial': dataInicial,
        'dataFinal': dataFinal,
        'cnpjOrgao': cnpjOrgao,
        'codigoUnidadeAdministrativa': codigoUnidadeAdministrativa,
        'usuarioId': usuarioId,
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
