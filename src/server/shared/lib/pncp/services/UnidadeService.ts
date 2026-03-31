/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AlterarUnidadeOrgaoDTO } from '../models/AlterarUnidadeOrgaoDTO';
import type { IncluirUnidadeOrgaoDTO } from '../models/IncluirUnidadeOrgaoDTO';
import type { UnidadeOrgaoDTO } from '../models/UnidadeOrgaoDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UnidadeService {
  /**
   * Consultar Unidades
   * @returns UnidadeOrgaoDTO OK
   * @throws ApiError
   */
  public static recuperarUnidadesOrgao({
    cnpj,
  }: {
    cnpj: string,
  }): CancelablePromise<Array<UnidadeOrgaoDTO>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/unidades',
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
   * Atualizar Unidade
   * @returns any OK
   * @throws ApiError
   */
  public static atualizarUnidadeOrgao({
    cnpj,
    requestBody,
  }: {
    cnpj: string,
    requestBody: AlterarUnidadeOrgaoDTO,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/orgaos/{cnpj}/unidades',
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
   * Inserir Unidade
   * @returns UnidadeOrgaoDTO OK
   * @throws ApiError
   */
  public static salvarUnidadeOrgao({
    cnpj,
    requestBody,
  }: {
    cnpj: string,
    requestBody: IncluirUnidadeOrgaoDTO,
  }): CancelablePromise<UnidadeOrgaoDTO> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/orgaos/{cnpj}/unidades',
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
   * Consultar Unidade
   * @returns UnidadeOrgaoDTO OK
   * @throws ApiError
   */
  public static recuperarUnidadeOrgao({
    cnpj,
    codigoUnidade,
  }: {
    cnpj: string,
    codigoUnidade: string,
  }): CancelablePromise<UnidadeOrgaoDTO> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/unidades/{codigoUnidade}',
      path: {
        'cnpj': cnpj,
        'codigoUnidade': codigoUnidade,
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
