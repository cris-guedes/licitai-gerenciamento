/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IncluirOrgaoDTO } from '../models/IncluirOrgaoDTO';
import type { OrgaoConsultaDTO } from '../models/OrgaoConsultaDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RgOService {
  /**
   * Atualizar Órgão
   * @returns any OK
   * @throws ApiError
   */
  public static putEnteGoverno({
    requestBody,
  }: {
    requestBody: IncluirOrgaoDTO,
  }): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/orgaos',
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
   * Inserir Órgão
   * @returns any OK
   * @throws ApiError
   */
  public static postEnteGoverno({
    requestBody,
  }: {
    requestBody: IncluirOrgaoDTO,
  }): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/orgaos',
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
   * Consultar Órgão por CNPJ
   * @returns OrgaoConsultaDTO OK
   * @throws ApiError
   */
  public static recuperarEnte({
    cnpj,
  }: {
    cnpj: string,
  }): CancelablePromise<OrgaoConsultaDTO> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}',
      path: {
        'cnpj': cnpj,
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
   * Consultar Órgão por ID
   * @returns OrgaoConsultaDTO OK
   * @throws ApiError
   */
  public static recuperarEnte1({
    orgaoId,
  }: {
    orgaoId: number,
  }): CancelablePromise<OrgaoConsultaDTO> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/id/{orgaoId}',
      path: {
        'orgaoId': orgaoId,
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
   * Consultar Órgão por Filtro
   * @returns OrgaoConsultaDTO OK
   * @throws ApiError
   */
  public static consultarEntesPorFiltro({
    razaoSocial,
    pagina = 1,
  }: {
    /**
     * Razão social com pelo menos 3 caracteres
     */
    razaoSocial: string,
    /**
     * Índice de paginação iniciando com valor = 1
     */
    pagina?: number,
  }): CancelablePromise<Array<OrgaoConsultaDTO>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/',
      query: {
        'razaoSocial': razaoSocial,
        'pagina': pagina,
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
