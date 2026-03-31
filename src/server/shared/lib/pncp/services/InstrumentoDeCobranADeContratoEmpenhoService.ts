/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConsultarInstrumentoCobrancaDTO } from '../models/ConsultarInstrumentoCobrancaDTO';
import type { ExcluirInstrumentoCobrancaContratoDTO } from '../models/ExcluirInstrumentoCobrancaContratoDTO';
import type { IncluirInstrumentoCobrancaContratoDTO } from '../models/IncluirInstrumentoCobrancaContratoDTO';
import type { RetificarInstrumentoCobrancaContratoDTO } from '../models/RetificarInstrumentoCobrancaContratoDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InstrumentoDeCobranADeContratoEmpenhoService {
  /**
   * Consultar Instrumentos de Cobrança de um Contrato/Empenho
   * @returns ConsultarInstrumentoCobrancaDTO OK
   * @throws ApiError
   */
  public static consultarInstrumentosCobranca({
    cnpj,
    ano,
    sequencialContrato,
  }: {
    cnpj: string,
    ano: number,
    sequencialContrato: number,
  }): CancelablePromise<Array<ConsultarInstrumentoCobrancaDTO>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencialContrato}/instrumentocobranca',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencialContrato': sequencialContrato,
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
   * Inserir Instrumento de Cobrança de um Contrato/Empenho
   * @returns any OK
   * @throws ApiError
   */
  public static inserirInstrumentoCobranca({
    cnpj,
    ano,
    sequencialContrato,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencialContrato: number,
    requestBody: IncluirInstrumentoCobrancaContratoDTO,
  }): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencialContrato}/instrumentocobranca',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencialContrato': sequencialContrato,
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
   * Consultar Instrumento de Cobrança de um Contrato/Empenho
   * @returns ConsultarInstrumentoCobrancaDTO OK
   * @throws ApiError
   */
  public static consultarInstrumentoCobranca({
    cnpj,
    ano,
    sequencialContrato,
    sequencialInstrumentoCobranca,
  }: {
    cnpj: string,
    ano: number,
    sequencialContrato: number,
    sequencialInstrumentoCobranca: number,
  }): CancelablePromise<ConsultarInstrumentoCobrancaDTO> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencialContrato}/instrumentocobranca/{sequencialInstrumentoCobranca}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencialContrato': sequencialContrato,
        'sequencialInstrumentoCobranca': sequencialInstrumentoCobranca,
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
   * Excluir Instrumento de Cobrança de Contrato/Empenho
   * @returns any OK
   * @throws ApiError
   */
  public static excluirInstrumentoCobranca({
    cnpj,
    ano,
    sequencialContrato,
    sequencialInstrumentoCobranca,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencialContrato: number,
    sequencialInstrumentoCobranca: number,
    requestBody: ExcluirInstrumentoCobrancaContratoDTO,
  }): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencialContrato}/instrumentocobranca/{sequencialInstrumentoCobranca}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencialContrato': sequencialContrato,
        'sequencialInstrumentoCobranca': sequencialInstrumentoCobranca,
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
   * Retificar Parcialmente Instrumento de Cobrança de Contrato/Empenho
   * @returns any OK
   * @throws ApiError
   */
  public static retificarInstrumentoCobranca({
    cnpj,
    ano,
    sequencialContrato,
    sequencialInstrumentoCobranca,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencialContrato: number,
    sequencialInstrumentoCobranca: number,
    requestBody: RetificarInstrumentoCobrancaContratoDTO,
  }): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencialContrato}/instrumentocobranca/{sequencialInstrumentoCobranca}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencialContrato': sequencialContrato,
        'sequencialInstrumentoCobranca': sequencialInstrumentoCobranca,
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
