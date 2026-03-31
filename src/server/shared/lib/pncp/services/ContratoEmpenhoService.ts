/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AlterarContratoDTO } from '../models/AlterarContratoDTO';
import type { ExclusaoDTO } from '../models/ExclusaoDTO';
import type { IncluirContratoDTO } from '../models/IncluirContratoDTO';
import type { PaginaRetornoRecuperarContratoDTO } from '../models/PaginaRetornoRecuperarContratoDTO';
import type { RecuperarContratoDTO } from '../models/RecuperarContratoDTO';
import type { RecuperarDadosDocumentoContratoDTO } from '../models/RecuperarDadosDocumentoContratoDTO';
import type { RecuperarHistoricoContratoDTO } from '../models/RecuperarHistoricoContratoDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ContratoEmpenhoService {
  /**
   * Consultar Contrato
   * @returns RecuperarContratoDTO OK
   * @throws ApiError
   */
  public static consultarContrato({
    cnpj,
    ano,
    sequencial,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
  }): CancelablePromise<RecuperarContratoDTO> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}',
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
   * Retificar Contrato
   * @returns any OK
   * @throws ApiError
   */
  public static retificarContrato({
    cnpj,
    ano,
    sequencial,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    requestBody: AlterarContratoDTO,
  }): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}',
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
   * Excluir Contrato
   * @returns any OK
   * @throws ApiError
   */
  public static removerContrato({
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
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}',
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
   * Inserir Contrato
   * @returns any OK
   * @throws ApiError
   */
  public static inserirContrato({
    cnpj,
    requestBody,
  }: {
    cnpj: string,
    requestBody: IncluirContratoDTO,
  }): CancelablePromise<Record<string, any>> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/orgaos/{cnpj}/contratos',
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
   * Consultar Documentos de Contrato
   * @returns RecuperarDadosDocumentoContratoDTO OK
   * @throws ApiError
   */
  public static recuperarInformacoesDocumentosContrato({
    cnpj,
    ano,
    sequencial,
    pagina,
    tamanhoPagina,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    pagina?: number,
    tamanhoPagina?: number,
  }): CancelablePromise<Array<RecuperarDadosDocumentoContratoDTO>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/arquivos',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
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
   * Inserir Documento de Contrato
   * @returns string OK
   * @throws ApiError
   */
  public static inserirArquivo1({
    cnpj,
    ano,
    sequencial,
    tituloDocumento,
    tipoDocumentoId,
    formData,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    tituloDocumento: string,
    tipoDocumentoId: number,
    formData?: {
      arquivo: Blob;
    },
  }): CancelablePromise<string> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/arquivos',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
      },
      headers: {
        'Titulo-Documento': tituloDocumento,
        'Tipo-Documento-Id': tipoDocumentoId,
      },
      formData: formData,
      mediaType: 'multipart/form-data',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        422: `Unprocessable Entity`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Consultar Histórico de Contrato
   * @returns RecuperarHistoricoContratoDTO OK
   * @throws ApiError
   */
  public static consultarContrato1({
    cnpj,
    ano,
    sequencial,
    pagina,
    tamanhoPagina,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    pagina?: number,
    tamanhoPagina?: number,
  }): CancelablePromise<Array<RecuperarHistoricoContratoDTO>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/historico',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
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
   * Consultar Quantidade Histórico de Contrato
   * @returns number OK
   * @throws ApiError
   */
  public static consultarContrato2({
    cnpj,
    ano,
    sequencial,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
  }): CancelablePromise<number> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/historico/quantidade',
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
   * Baixar Arquivo/Documento de Contrato/Empenho
   * @returns binary OK
   * @throws ApiError
   */
  public static recuperarArquivo1({
    cnpj,
    ano,
    sequencial,
    sequencialDocumento,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    sequencialDocumento: number,
  }): CancelablePromise<Blob> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/arquivos/{sequencialDocumento}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'sequencialDocumento': sequencialDocumento,
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
   * Excluir Arquivo/Documento de Contrato/Empenho
   * @returns any OK
   * @throws ApiError
   */
  public static removerDocumentoContrato1({
    cnpj,
    ano,
    sequencial,
    sequencialDocumento,
    requestBody,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    sequencialDocumento: number,
    requestBody: ExclusaoDTO,
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/arquivos/{sequencialDocumento}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'sequencialDocumento': sequencialDocumento,
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
   * Consultar Quantidade de Documentos de Contrato
   * @returns number OK
   * @throws ApiError
   */
  public static recuperarContratoDocumentoQuantidade({
    cnpj,
    ano,
    sequencial,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
  }): CancelablePromise<number> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/arquivos/quantidade',
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
   * Baixar Arquivo/Documento Excluído de Contrato/Empenho
   * @returns binary OK
   * @throws ApiError
   */
  public static recuperarArquivo2({
    cnpj,
    ano,
    sequencial,
    sequencialDocumento,
  }: {
    cnpj: string,
    ano: number,
    sequencial: number,
    sequencialDocumento: number,
  }): CancelablePromise<Blob> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/contratos/{ano}/{sequencial}/arquivos/excluidos/{sequencialDocumento}',
      path: {
        'cnpj': cnpj,
        'ano': ano,
        'sequencial': sequencial,
        'sequencialDocumento': sequencialDocumento,
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
   * Consultar Contratos de uma Contratação
   * @returns PaginaRetornoRecuperarContratoDTO OK
   * @throws ApiError
   */
  public static consultarContratosContratacao({
    cnpj,
    anoContratacao,
    sequencialContratacao,
    pagina,
    tamanhoPagina,
  }: {
    cnpj: string,
    anoContratacao: number,
    sequencialContratacao: number,
    pagina: number,
    tamanhoPagina?: number,
  }): CancelablePromise<PaginaRetornoRecuperarContratoDTO> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v1/orgaos/{cnpj}/contratos/contratacao/{anoContratacao}/{sequencialContratacao}',
      path: {
        'cnpj': cnpj,
        'anoContratacao': anoContratacao,
        'sequencialContratacao': sequencialContratacao,
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
}
