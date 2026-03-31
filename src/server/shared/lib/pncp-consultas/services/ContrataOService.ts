/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginaRetornoRecuperarCompraPublicacaoDTO } from '../models/PaginaRetornoRecuperarCompraPublicacaoDTO';
import type { RecuperarCompraDTO } from '../models/RecuperarCompraDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ContrataOService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Consultar Contratação
   * @returns RecuperarCompraDTO OK
   * @throws ApiError
   */
  public consultarCompra({
    cnpj,
    ano,
    sequencial,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
  }): CancelablePromise<RecuperarCompraDTO> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/compras/{ano}/{sequencial}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
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
   * Consultar Contratações por Data de Publicação
   * @returns PaginaRetornoRecuperarCompraPublicacaoDTO OK
   * @throws ApiError
   */
  public consultarContratacaoPorDataDePublicacao({
    dataInicial,
    dataFinal,
    codigoModalidadeContratacao,
    pagina,
    codigoModoDisputa,
    uf,
    codigoMunicipioIbge,
    cnpj,
    codigoUnidadeAdministrativa,
    idUsuario,
    tamanhoPagina,
  }: {
    dataInicial: string,
    dataFinal: string,
    codigoModalidadeContratacao: number,
    pagina: number,
    codigoModoDisputa?: number,
    uf?: string,
    codigoMunicipioIbge?: string,
    cnpj?: string,
    codigoUnidadeAdministrativa?: string,
    idUsuario?: number,
    tamanhoPagina?: number,
  }): CancelablePromise<PaginaRetornoRecuperarCompraPublicacaoDTO> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/contratacoes/publicacao',
      query: {
        'dataInicial': dataInicial,
        'dataFinal': dataFinal,
        'codigoModalidadeContratacao': codigoModalidadeContratacao,
        'codigoModoDisputa': codigoModoDisputa,
        'uf': uf,
        'codigoMunicipioIbge': codigoMunicipioIbge,
        'cnpj': cnpj,
        'codigoUnidadeAdministrativa': codigoUnidadeAdministrativa,
        'idUsuario': idUsuario,
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
   * Consultar Contratações com Recebimento de Propostas Aberto
   * @returns PaginaRetornoRecuperarCompraPublicacaoDTO OK
   * @throws ApiError
   */
  public consultarContratacaoPeriodoRecebimentoPropostas({
    dataFinal,
    pagina,
    codigoModalidadeContratacao,
    uf,
    codigoMunicipioIbge,
    cnpj,
    codigoUnidadeAdministrativa,
    idUsuario,
    tamanhoPagina,
  }: {
    dataFinal: string,
    pagina: number,
    codigoModalidadeContratacao?: number,
    uf?: string,
    codigoMunicipioIbge?: string,
    cnpj?: string,
    codigoUnidadeAdministrativa?: string,
    idUsuario?: number,
    tamanhoPagina?: number,
  }): CancelablePromise<PaginaRetornoRecuperarCompraPublicacaoDTO> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/contratacoes/proposta',
      query: {
        'dataFinal': dataFinal,
        'codigoModalidadeContratacao': codigoModalidadeContratacao,
        'uf': uf,
        'codigoMunicipioIbge': codigoMunicipioIbge,
        'cnpj': cnpj,
        'codigoUnidadeAdministrativa': codigoUnidadeAdministrativa,
        'idUsuario': idUsuario,
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
   * Consultar Contratações por Data de Atualização Global
   * @returns PaginaRetornoRecuperarCompraPublicacaoDTO OK
   * @throws ApiError
   */
  public consultarContratacaoPorDataUltimaAtualizacao({
    dataInicial,
    dataFinal,
    codigoModalidadeContratacao,
    pagina,
    codigoModoDisputa,
    uf,
    codigoMunicipioIbge,
    cnpj,
    codigoUnidadeAdministrativa,
    idUsuario,
    tamanhoPagina,
  }: {
    dataInicial: string,
    dataFinal: string,
    codigoModalidadeContratacao: number,
    pagina: number,
    codigoModoDisputa?: number,
    uf?: string,
    codigoMunicipioIbge?: string,
    cnpj?: string,
    codigoUnidadeAdministrativa?: string,
    idUsuario?: number,
    tamanhoPagina?: number,
  }): CancelablePromise<PaginaRetornoRecuperarCompraPublicacaoDTO> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/v1/contratacoes/atualizacao',
      query: {
        'dataInicial': dataInicial,
        'dataFinal': dataFinal,
        'codigoModalidadeContratacao': codigoModalidadeContratacao,
        'codigoModoDisputa': codigoModoDisputa,
        'uf': uf,
        'codigoMunicipioIbge': codigoMunicipioIbge,
        'cnpj': cnpj,
        'codigoUnidadeAdministrativa': codigoUnidadeAdministrativa,
        'idUsuario': idUsuario,
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
