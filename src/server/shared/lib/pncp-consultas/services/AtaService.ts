/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginaRetornoAtaRegistroPrecoPeriodoDTO } from '../models/PaginaRetornoAtaRegistroPrecoPeriodoDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AtaService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Consultar Ata de Registro de Preço por Período de Vigência
   * @returns PaginaRetornoAtaRegistroPrecoPeriodoDTO OK
   * @throws ApiError
   */
  public consultarAtaRegistroPrecoPeriodo({
    dataInicial,
    dataFinal,
    pagina,
    idUsuario,
    cnpj,
    codigoUnidadeAdministrativa,
    tamanhoPagina,
  }: {
    dataInicial: string,
    dataFinal: string,
    pagina: number,
    idUsuario?: number,
    cnpj?: string,
    codigoUnidadeAdministrativa?: string,
    tamanhoPagina?: number,
  }): CancelablePromise<PaginaRetornoAtaRegistroPrecoPeriodoDTO> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/atas',
      query: {
        'dataInicial': dataInicial,
        'dataFinal': dataFinal,
        'idUsuario': idUsuario,
        'cnpj': cnpj,
        'codigoUnidadeAdministrativa': codigoUnidadeAdministrativa,
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
   * Consultar Atas de Registro de Preço por Data de Atualização Global
   * @returns PaginaRetornoAtaRegistroPrecoPeriodoDTO OK
   * @throws ApiError
   */
  public consultarAtaRegistroPrecoDataAtualizacao({
    dataInicial,
    dataFinal,
    pagina,
    idUsuario,
    cnpj,
    codigoUnidadeAdministrativa,
    tamanhoPagina,
  }: {
    dataInicial: string,
    dataFinal: string,
    pagina: number,
    idUsuario?: number,
    cnpj?: string,
    codigoUnidadeAdministrativa?: string,
    tamanhoPagina?: number,
  }): CancelablePromise<PaginaRetornoAtaRegistroPrecoPeriodoDTO> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/atas/atualizacao',
      query: {
        'dataInicial': dataInicial,
        'dataFinal': dataFinal,
        'idUsuario': idUsuario,
        'cnpj': cnpj,
        'codigoUnidadeAdministrativa': codigoUnidadeAdministrativa,
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
