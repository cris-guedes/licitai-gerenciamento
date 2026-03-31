/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExclusaoDTO } from '../models/ExclusaoDTO';
import type { ExclusaoItemPcaDTO } from '../models/ExclusaoItemPcaDTO';
import type { ExclusaoListaItensPcaDTO } from '../models/ExclusaoListaItensPcaDTO';
import type { IncluirPlanoContratacaoDTO } from '../models/IncluirPlanoContratacaoDTO';
import type { IncluirPlanoContratacaoItemDTO } from '../models/IncluirPlanoContratacaoItemDTO';
import type { IRecuperarPlanoItemDTO } from '../models/IRecuperarPlanoItemDTO';
import type { PlanoContratacaoComItensDTO } from '../models/PlanoContratacaoComItensDTO';
import type { PlanoContratacaoItemOrgaoToDTO } from '../models/PlanoContratacaoItemOrgaoToDTO';
import type { PlanoContratacaoOrgaoDTO } from '../models/PlanoContratacaoOrgaoDTO';
import type { PlanoSequencialConsolidadoDTO } from '../models/PlanoSequencialConsolidadoDTO';
import type { RecuperarValoresCategoriaItemPcaDTO } from '../models/RecuperarValoresCategoriaItemPcaDTO';
import type { RetificarParcialPlanoContratacaoItemDTO } from '../models/RetificarParcialPlanoContratacaoItemDTO';
import type { RetificarParcialPlanoContratacaoListaItensDTO } from '../models/RetificarParcialPlanoContratacaoListaItensDTO';
import type { SequenciaisDTO } from '../models/SequenciaisDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PlanoDeContrataOService {
  /**
   * Inserir Plano de Contratação
   * @returns any OK
   * @throws ApiError
   */
  public static incluirPlano({
    cnpj,
    requestBody,
  }: {
    cnpj: string,
    requestBody: IncluirPlanoContratacaoDTO,
  }): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/orgaos/{cnpj}/pca',
      path: {
        'cnpj': cnpj,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Consultar Itens do Plano de Contratação
   * @returns IRecuperarPlanoItemDTO OK
   * @throws ApiError
   */
  public static recuperarDadosPcaItensCategoria({
    cnpj,
    ano,
    sequencial,
    categoria,
    pagina,
    tamanhoPagina,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    categoria?: number,
    pagina?: number,
    tamanhoPagina?: number,
  }): CancelablePromise<Array<IRecuperarPlanoItemDTO>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/itens',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
      },
      query: {
        'categoria': categoria,
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
   * Inserir itens de Plano de Contratação
   * @returns any OK
   * @throws ApiError
   */
  public static incluirPlanoContratacaoItem({
    cnpj,
    ano,
    sequencial,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    requestBody: Array<IncluirPlanoContratacaoItemDTO>,
  }): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/itens',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Excluir Itens de Plano de Contratação
   * @returns any OK
   * @throws ApiError
   */
  public static removerItensPlano({
    cnpj,
    ano,
    sequencial,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    requestBody: ExclusaoListaItensPcaDTO,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/itens',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Retificar Parcialmente itens de Plano de Contratação
   * @returns any OK
   * @throws ApiError
   */
  public static retificarParcialmentePlanoContratacaoItens({
    cnpj,
    ano,
    sequencial,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    requestBody: RetificarParcialPlanoContratacaoListaItensDTO,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/itens',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Excluir Item de Plano de Contratação
   * @returns any OK
   * @throws ApiError
   */
  public static removerItemPlano({
    cnpj,
    ano,
    sequencial,
    numeroItem,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    numeroItem: number,
    requestBody?: ExclusaoItemPcaDTO,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/itens/{numeroItem}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'numeroItem': numeroItem,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Retificar Parcialmente item de Plano de Contratação
   * @returns any OK
   * @throws ApiError
   */
  public static retificarParcialmentePlanoContratacaoItem({
    cnpj,
    ano,
    sequencial,
    numeroItem,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    numeroItem: number,
    requestBody: RetificarParcialPlanoContratacaoItemDTO,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/itens/{numeroItem}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'numeroItem': numeroItem,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * @returns SequenciaisDTO OK
   * @throws ApiError
   */
  public static recuperarSequenciaisDoPlano({
    cnpj,
    uasg,
    ano,
  }: {
    cnpj: string,
    uasg: string,
    ano: number,
  }): CancelablePromise<SequenciaisDTO> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/pca/{uasg}/{ano}/sequenciaisplano',
      path: {
        'cnpj': cnpj,
        'uasg': uasg,
        'ano': ano,
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
   * Consultar Valores de um Plano de Contratação por Categoria
   * @returns RecuperarValoresCategoriaItemPcaDTO OK
   * @throws ApiError
   */
  public static recuperarValoresCategoriaItem({
    cnpj,
    ano,
    sequencial,
    categoriaItem,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    categoriaItem?: number,
  }): CancelablePromise<Array<RecuperarValoresCategoriaItemPcaDTO>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/valorescategoriaitem',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
      },
      query: {
        'categoriaItem': categoriaItem,
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
   * Consultar Quantidade de Itens do Plano de Contratação
   * @returns number OK
   * @throws ApiError
   */
  public static recuperarDadosPcaItensQuantidadeItens({
    cnpj,
    ano,
    sequencial,
    categoria,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    categoria?: number,
  }): CancelablePromise<number> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/itens/quantidade',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
      },
      query: {
        'categoria': categoria,
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
   * Consultar Plano de Contratação com Itens
   * @returns PlanoContratacaoComItensDTO OK
   * @throws ApiError
   */
  public static consultarPlanoComItens({
    cnpj,
    ano,
    sequencial,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
  }): CancelablePromise<PlanoContratacaoComItensDTO> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/itens/plano',
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
   * Retornar Itens de Plano de Contratação por número da Contratação
   * @returns IRecuperarPlanoItemDTO OK
   * @throws ApiError
   */
  public static recuperarItensPlanoPorContratacao({
    cnpj,
    ano,
    sequencial,
    numeroContratacao,
    page,
    size = 10,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    numeroContratacao: string,
    page?: number,
    size?: number,
  }): CancelablePromise<Array<IRecuperarPlanoItemDTO>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/itens/contratacao',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
      },
      query: {
        'numeroContratacao': numeroContratacao,
        'page': page,
        'size': size,
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
   * Excluir Itens de Plano de Contratação por número da Contratação
   * @returns any OK
   * @throws ApiError
   */
  public static removerItensPlanoPorContratacao({
    cnpj,
    ano,
    sequencial,
    numeroContratacao,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    numeroContratacao: string,
    requestBody: ExclusaoItemPcaDTO,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/itens/contratacao',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
      },
      query: {
        'numeroContratacao': numeroContratacao,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Consultar Plano de Contratação Consolidado
   * @returns PlanoSequencialConsolidadoDTO OK
   * @throws ApiError
   */
  public static consultarPlanoConsolidado({
    cnpj,
    ano,
    sequencial,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
  }): CancelablePromise<PlanoSequencialConsolidadoDTO> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/pca/{ano}/{sequencial}/consolidado',
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
   * Consultar Valores de Planos de Contratação de um Órgão por Categoria
   * @returns RecuperarValoresCategoriaItemPcaDTO OK
   * @throws ApiError
   */
  public static recuperarValoresCategoriaItem1({
    cnpj,
    ano,
    categoriaItem,
  }: {
    cnpj: string,
    ano: number,
    categoriaItem?: number,
  }): CancelablePromise<Array<RecuperarValoresCategoriaItemPcaDTO>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/pca/{ano}/valorescategoriaitem',
      path: {
        'cnpj': cnpj,
        'ano': ano,
      },
      query: {
        'categoriaItem': categoriaItem,
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
   * Consultar Quantidade de Planos de Contratação
   * @returns number OK
   * @throws ApiError
   */
  public static recuperarDadosOrgaoPcaQuantidade({
    cnpj,
    ano,
  }: {
    cnpj: string,
    ano: number,
  }): CancelablePromise<number> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/pca/{ano}/quantidade',
      path: {
        'cnpj': cnpj,
        'ano': ano,
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
   * Baixar CSV dos Planos de Contratação por Órgão e Ano
   * @returns string OK
   * @throws ApiError
   */
  public static retornarPlanosTodasUnidadesDoOrgaoCsv({
    cnpj,
    ano,
  }: {
    cnpj: string,
    ano: number,
  }): CancelablePromise<Array<string>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/pca/{ano}/csv',
      path: {
        'cnpj': cnpj,
        'ano': ano,
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
   * Consultar Planos de Contratação Consolidados por Órgão e Ano
   * @returns PlanoContratacaoItemOrgaoToDTO OK
   * @throws ApiError
   */
  public static recuperarDadosOrgaoPca({
    cnpj,
    ano,
  }: {
    cnpj: string,
    ano: number,
  }): CancelablePromise<PlanoContratacaoItemOrgaoToDTO> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/pca/{ano}/consolidado',
      path: {
        'cnpj': cnpj,
        'ano': ano,
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
   * Consultar Planos de Contratação Consolidados das Unidades por Órgão e Ano
   * @returns PlanoContratacaoOrgaoDTO OK
   * @throws ApiError
   */
  public static recuperarDadosOrgaoPcaUnidades({
    cnpj,
    ano,
    pagina,
    tamanhoPagina,
  }: {
    cnpj: string,
    ano: number,
    pagina?: number,
    tamanhoPagina?: number,
  }): CancelablePromise<Array<PlanoContratacaoOrgaoDTO>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/pca/{ano}/consolidado/unidades',
      path: {
        'cnpj': cnpj,
        'ano': ano,
      },
      query: {
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
   * Excluir Plano de Contratação
   * @returns any OK
   * @throws ApiError
   */
  public static removerPlano({
    cnpj,
    ano,
    sequencial,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    requestBody?: ExclusaoDTO,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/orgaos/{cnpj}/pca/{ano}/{sequencial}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
}
