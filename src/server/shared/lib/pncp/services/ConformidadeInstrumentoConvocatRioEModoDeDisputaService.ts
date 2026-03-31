/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExcluirDominioGenericoDTO } from '../models/ExcluirDominioGenericoDTO';
import type { IncluirTipoInstrumentoConvocatorioModoDisputaDTO } from '../models/IncluirTipoInstrumentoConvocatorioModoDisputaDTO';
import type { TipoInstrumentoConvocatorioModoDisputaDTO } from '../models/TipoInstrumentoConvocatorioModoDisputaDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ConformidadeInstrumentoConvocatRioEModoDeDisputaService {
  /**
   * Consultar conformidade entre instrumentos convocatórios e modos de disputa
   * @returns any OK
   * @throws ApiError
   */
  public static obterRegistros({
    tipoInstrumentoConvocatorioId,
    modoDisputaId,
  }: {
    tipoInstrumentoConvocatorioId?: number,
    modoDisputaId?: number,
  }): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/tipo-instrumento-convocatorio-modo-disputa',
      query: {
        'tipoInstrumentoConvocatorioId': tipoInstrumentoConvocatorioId,
        'modoDisputaId': modoDisputaId,
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
   * Inserir conformidade entre instrumentos convocatórios e modos de disputa
   * @returns string OK
   * @throws ApiError
   */
  public static incluirRegistro2({
    requestBody,
  }: {
    requestBody: IncluirTipoInstrumentoConvocatorioModoDisputaDTO,
  }): CancelablePromise<'100 CONTINUE' | '101 SWITCHING_PROTOCOLS' | '102 PROCESSING' | '103 CHECKPOINT' | '200 OK' | '201 CREATED' | '202 ACCEPTED' | '203 NON_AUTHORITATIVE_INFORMATION' | '204 NO_CONTENT' | '205 RESET_CONTENT' | '206 PARTIAL_CONTENT' | '207 MULTI_STATUS' | '208 ALREADY_REPORTED' | '226 IM_USED' | '300 MULTIPLE_CHOICES' | '301 MOVED_PERMANENTLY' | '302 FOUND' | '302 MOVED_TEMPORARILY' | '303 SEE_OTHER' | '304 NOT_MODIFIED' | '305 USE_PROXY' | '307 TEMPORARY_REDIRECT' | '308 PERMANENT_REDIRECT' | '400 BAD_REQUEST' | '401 UNAUTHORIZED' | '402 PAYMENT_REQUIRED' | '403 FORBIDDEN' | '404 NOT_FOUND' | '405 METHOD_NOT_ALLOWED' | '406 NOT_ACCEPTABLE' | '407 PROXY_AUTHENTICATION_REQUIRED' | '408 REQUEST_TIMEOUT' | '409 CONFLICT' | '410 GONE' | '411 LENGTH_REQUIRED' | '412 PRECONDITION_FAILED' | '413 PAYLOAD_TOO_LARGE' | '413 REQUEST_ENTITY_TOO_LARGE' | '414 URI_TOO_LONG' | '414 REQUEST_URI_TOO_LONG' | '415 UNSUPPORTED_MEDIA_TYPE' | '416 REQUESTED_RANGE_NOT_SATISFIABLE' | '417 EXPECTATION_FAILED' | '418 I_AM_A_TEAPOT' | '419 INSUFFICIENT_SPACE_ON_RESOURCE' | '420 METHOD_FAILURE' | '421 DESTINATION_LOCKED' | '422 UNPROCESSABLE_ENTITY' | '423 LOCKED' | '424 FAILED_DEPENDENCY' | '425 TOO_EARLY' | '426 UPGRADE_REQUIRED' | '428 PRECONDITION_REQUIRED' | '429 TOO_MANY_REQUESTS' | '431 REQUEST_HEADER_FIELDS_TOO_LARGE' | '451 UNAVAILABLE_FOR_LEGAL_REASONS' | '500 INTERNAL_SERVER_ERROR' | '501 NOT_IMPLEMENTED' | '502 BAD_GATEWAY' | '503 SERVICE_UNAVAILABLE' | '504 GATEWAY_TIMEOUT' | '505 HTTP_VERSION_NOT_SUPPORTED' | '506 VARIANT_ALSO_NEGOTIATES' | '507 INSUFFICIENT_STORAGE' | '508 LOOP_DETECTED' | '509 BANDWIDTH_LIMIT_EXCEEDED' | '510 NOT_EXTENDED' | '511 NETWORK_AUTHENTICATION_REQUIRED'> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/tipo-instrumento-convocatorio-modo-disputa',
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
   * Consultar conformidade entre instrumentos convocatórios e modos de disputa por código
   * @returns TipoInstrumentoConvocatorioModoDisputaDTO OK
   * @throws ApiError
   */
  public static obterRegistro2({
    tipoInstrumentoConvocatorioId,
    modoDisputaId,
  }: {
    tipoInstrumentoConvocatorioId: number,
    modoDisputaId: number,
  }): CancelablePromise<TipoInstrumentoConvocatorioModoDisputaDTO> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/tipo-instrumento-convocatorio-modo-disputa/{tipoInstrumentoConvocatorioId}/{modoDisputaId}',
      path: {
        'tipoInstrumentoConvocatorioId': tipoInstrumentoConvocatorioId,
        'modoDisputaId': modoDisputaId,
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
   * Excluir conformidade entre instrumento convocatório e modo de disputa
   * @returns string OK
   * @throws ApiError
   */
  public static excluirRegistro({
    tipoInstrumentoConvocatorioId,
    modoDisputaId,
    requestBody,
  }: {
    tipoInstrumentoConvocatorioId: number,
    modoDisputaId: number,
    requestBody: ExcluirDominioGenericoDTO,
  }): CancelablePromise<'100 CONTINUE' | '101 SWITCHING_PROTOCOLS' | '102 PROCESSING' | '103 CHECKPOINT' | '200 OK' | '201 CREATED' | '202 ACCEPTED' | '203 NON_AUTHORITATIVE_INFORMATION' | '204 NO_CONTENT' | '205 RESET_CONTENT' | '206 PARTIAL_CONTENT' | '207 MULTI_STATUS' | '208 ALREADY_REPORTED' | '226 IM_USED' | '300 MULTIPLE_CHOICES' | '301 MOVED_PERMANENTLY' | '302 FOUND' | '302 MOVED_TEMPORARILY' | '303 SEE_OTHER' | '304 NOT_MODIFIED' | '305 USE_PROXY' | '307 TEMPORARY_REDIRECT' | '308 PERMANENT_REDIRECT' | '400 BAD_REQUEST' | '401 UNAUTHORIZED' | '402 PAYMENT_REQUIRED' | '403 FORBIDDEN' | '404 NOT_FOUND' | '405 METHOD_NOT_ALLOWED' | '406 NOT_ACCEPTABLE' | '407 PROXY_AUTHENTICATION_REQUIRED' | '408 REQUEST_TIMEOUT' | '409 CONFLICT' | '410 GONE' | '411 LENGTH_REQUIRED' | '412 PRECONDITION_FAILED' | '413 PAYLOAD_TOO_LARGE' | '413 REQUEST_ENTITY_TOO_LARGE' | '414 URI_TOO_LONG' | '414 REQUEST_URI_TOO_LONG' | '415 UNSUPPORTED_MEDIA_TYPE' | '416 REQUESTED_RANGE_NOT_SATISFIABLE' | '417 EXPECTATION_FAILED' | '418 I_AM_A_TEAPOT' | '419 INSUFFICIENT_SPACE_ON_RESOURCE' | '420 METHOD_FAILURE' | '421 DESTINATION_LOCKED' | '422 UNPROCESSABLE_ENTITY' | '423 LOCKED' | '424 FAILED_DEPENDENCY' | '425 TOO_EARLY' | '426 UPGRADE_REQUIRED' | '428 PRECONDITION_REQUIRED' | '429 TOO_MANY_REQUESTS' | '431 REQUEST_HEADER_FIELDS_TOO_LARGE' | '451 UNAVAILABLE_FOR_LEGAL_REASONS' | '500 INTERNAL_SERVER_ERROR' | '501 NOT_IMPLEMENTED' | '502 BAD_GATEWAY' | '503 SERVICE_UNAVAILABLE' | '504 GATEWAY_TIMEOUT' | '505 HTTP_VERSION_NOT_SUPPORTED' | '506 VARIANT_ALSO_NEGOTIATES' | '507 INSUFFICIENT_STORAGE' | '508 LOOP_DETECTED' | '509 BANDWIDTH_LIMIT_EXCEEDED' | '510 NOT_EXTENDED' | '511 NETWORK_AUTHENTICATION_REQUIRED'> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/tipo-instrumento-convocatorio-modo-disputa/{tipoInstrumentoConvocatorioId}/{modoDisputaId}',
      path: {
        'tipoInstrumentoConvocatorioId': tipoInstrumentoConvocatorioId,
        'modoDisputaId': modoDisputaId,
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
