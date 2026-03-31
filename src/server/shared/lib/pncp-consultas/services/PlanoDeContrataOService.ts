/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginaRetornoPlanoContratacaoComItensDoUsuarioDTO } from '../models/PaginaRetornoPlanoContratacaoComItensDoUsuarioDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PlanoDeContrataOService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Consultar Itens de PCA por Ano do PCA, IdUsuario e Código de Classificação Superior
   * @returns PaginaRetornoPlanoContratacaoComItensDoUsuarioDTO OK
   * @throws ApiError
   */
  public consultarItensPorUsuarioAno({
    anoPca,
    idUsuario,
    pagina,
    codigoClassificacaoSuperior,
    cnpj,
    tamanhoPagina,
  }: {
    anoPca: number,
    idUsuario: number,
    pagina: number,
    codigoClassificacaoSuperior?: string,
    cnpj?: string,
    tamanhoPagina?: number,
  }): CancelablePromise<PaginaRetornoPlanoContratacaoComItensDoUsuarioDTO> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/pca/usuario',
      query: {
        'anoPca': anoPca,
        'idUsuario': idUsuario,
        'codigoClassificacaoSuperior': codigoClassificacaoSuperior,
        'cnpj': cnpj,
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
   * Consultar PCA por Data de Atualização Global
   * @returns PaginaRetornoPlanoContratacaoComItensDoUsuarioDTO OK
   * @throws ApiError
   */
  public consultarItensPorUsuarioAno1({
    dataInicio,
    dataFim,
    pagina,
    cnpj,
    codigoUnidade,
    tamanhoPagina,
  }: {
    dataInicio: string,
    dataFim: string,
    pagina: number,
    cnpj?: string,
    codigoUnidade?: string,
    tamanhoPagina?: number,
  }): CancelablePromise<PaginaRetornoPlanoContratacaoComItensDoUsuarioDTO> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/pca/atualizacao',
      query: {
        'dataInicio': dataInicio,
        'dataFim': dataFim,
        'cnpj': cnpj,
        'codigoUnidade': codigoUnidade,
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
   * Consultar Itens de PCA por Ano do PCA e Código de Classificação Superior
   * @returns PaginaRetornoPlanoContratacaoComItensDoUsuarioDTO OK
   * @throws ApiError
   */
  public consultarItensPorAno({
    anoPca,
    codigoClassificacaoSuperior,
    pagina,
    tamanhoPagina,
  }: {
    anoPca: number,
    codigoClassificacaoSuperior: string,
    pagina: number,
    tamanhoPagina?: number,
  }): CancelablePromise<PaginaRetornoPlanoContratacaoComItensDoUsuarioDTO> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/pca/',
      query: {
        'anoPca': anoPca,
        'codigoClassificacaoSuperior': codigoClassificacaoSuperior,
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
